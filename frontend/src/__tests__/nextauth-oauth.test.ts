import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { NextAuthOptions } from "next-auth";

type SignInArgs = Parameters<NonNullable<NonNullable<NextAuthOptions["callbacks"]>["signIn"]>>[0];
type JwtArgs = Parameters<NonNullable<NonNullable<NextAuthOptions["callbacks"]>["jwt"]>>[0];

const fetchMock = vi.hoisted(() => vi.fn());

vi.stubGlobal("fetch", fetchMock);

async function loadAuthOptions() {
  vi.resetModules();
  return (await import("../lib/nextauth")).authOptions;
}

function oauthArgs(overrides: Partial<SignInArgs> = {}): SignInArgs {
  return {
    user: { id: "provider-user", email: "provider@example.com", name: "Provider User" },
    account: { type: "oauth", provider: "google", providerAccountId: "provider-subject" },
    profile: {
      sub: "provider-subject",
      email: "provider@example.com",
      name: "Provider User",
      email_verified: true,
    } as SignInArgs["profile"],
    ...overrides,
  };
}

function exchangeResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("NextAuth OAuth configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXTAUTH_SECRET", "nextauth-test-secret");
    vi.stubEnv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:4000/");
    vi.stubEnv("OAUTH_BRIDGE_SECRET", "bridge-test-secret");
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-client-secret");
    vi.stubEnv("AZURE_AD_CLIENT_ID", "azure-client-id");
    vi.stubEnv("AZURE_AD_CLIENT_SECRET", "azure-client-secret");
    vi.stubEnv("AZURE_AD_TENANT_ID", "common");
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("registers credentials, Google, and Azure AD with identity-only account chooser scopes", async () => {
    const authOptions = await loadAuthOptions();
    expect(authOptions.providers.map((provider) => provider.id)).toEqual(["credentials", "google", "azure-ad"]);

    const google = authOptions.providers.find((provider) => provider.id === "google");
    const azure = authOptions.providers.find((provider) => provider.id === "azure-ad");
    expect(google && typeof google === "object" && "options" in google ? google.options?.authorization : null).toMatchObject({
      params: { prompt: "select_account", scope: "openid email profile" },
    });
    expect(azure && typeof azure === "object" && "options" in azure ? azure.options?.authorization : null).toMatchObject({
      params: { prompt: "select_account", scope: "openid email profile" },
    });
  });

  it("keeps password login and the other provider when one OAuth pair is incomplete", async () => {
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    const authOptions = await loadAuthOptions();
    expect(authOptions.providers.map((provider) => provider.id)).toEqual(["credentials", "azure-ad"]);
  });

  it("passes the backend exchange result from signIn into the first jwt callback", async () => {
    const authOptions = await loadAuthOptions();
    fetchMock.mockResolvedValue(
      exchangeResponse({
        token: "backend-token",
        tokenExpiresAt: 2_000_000_000,
        user: { id: "backend-user", email: "provider@example.com", name: "Saved Name" },
      })
    );

    const signIn = authOptions.callbacks?.signIn;
    const jwt = authOptions.callbacks?.jwt;
    if (!signIn || !jwt) throw new Error("Auth callbacks are not configured");

    const user = { id: "provider-user", email: "provider@example.com", name: "Provider User" };
    const result = await signIn(oauthArgs({ user }));
    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/auth/oauth/exchange",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer bridge-test-secret" }),
      })
    );

    const firstToken = await jwt({ token: {}, user } as JwtArgs);
    expect(firstToken).toMatchObject({
      id: "backend-user",
      email: "provider@example.com",
      name: "Saved Name",
      token: "backend-token",
      tokenExpiresAt: 2_000_000_000,
    });
  });

  it("rejects an unverified Google identity and a Microsoft identity without an email claim", async () => {
    const authOptions = await loadAuthOptions();
    const signIn = authOptions.callbacks?.signIn;
    if (!signIn) throw new Error("signIn callback is not configured");

    const googleResult = await signIn(
      oauthArgs({
        profile: { sub: "google-subject", email: "provider@example.com", email_verified: false } as SignInArgs["profile"],
      })
    );
    const microsoftResult = await signIn(
      oauthArgs({
        account: { type: "oauth", provider: "azure-ad", providerAccountId: "microsoft-subject" },
        profile: { sub: "microsoft-subject", preferred_username: "provider@example.com" } as SignInArgs["profile"],
      })
    );

    expect(googleResult).toBe("/login?error=OAuthEmailUnverified");
    expect(microsoftResult).toBe("/login?error=OAuthEmailRequired");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps exchange failures to fixed safe redirects", async () => {
    const authOptions = await loadAuthOptions();
    fetchMock.mockResolvedValue(exchangeResponse({ code: "OAUTH_EMAIL_CONFLICT" }, 409));
    const signIn = authOptions.callbacks?.signIn;
    if (!signIn) throw new Error("signIn callback is not configured");

    await expect(signIn(oauthArgs())).resolves.toBe("/login?error=OAuthEmailConflict");
  });

  it("keeps tokenExpiresAt immutable on later jwt callbacks", async () => {
    const authOptions = await loadAuthOptions();
    const jwt = authOptions.callbacks?.jwt;
    if (!jwt) throw new Error("jwt callback is not configured");

    const original = {
      id: "backend-user",
      email: "provider@example.com",
      token: "backend-token",
      tokenExpiresAt: 2_000_000_000,
    };
    const refreshed = await jwt({ token: original } as JwtArgs);
    expect(refreshed.tokenExpiresAt).toBe(original.tokenExpiresAt);
  });
});
