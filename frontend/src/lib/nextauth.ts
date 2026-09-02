import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Profile, User } from "next-auth";
import { APP_SESSION_TTL_SECONDS } from "./auth-constants";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/+$/, "");
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret?.trim()) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable. This is required for session security.");
}

if (!backendUrl) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL environment variable for NextAuth.");
}

type OAuthProviderId = "google" | "azure-ad";

type BackendAuthResponse = {
  token: string;
  tokenExpiresAt: number;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
};

type OAuthExchangeResult =
  | { ok: true; data: BackendAuthResponse }
  | { ok: false; code: "OAuthEmailConflict" | "OAuthEmailRequired" | "OAuthEmailUnverified" | "OAuthUnavailable" };

function isBackendAuthResponse(value: unknown): value is BackendAuthResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { token?: unknown; tokenExpiresAt?: unknown; user?: unknown };
  if (typeof candidate.token !== "string" || candidate.token.length === 0) return false;
  if (typeof candidate.tokenExpiresAt !== "number" || !Number.isSafeInteger(candidate.tokenExpiresAt) || candidate.tokenExpiresAt <= 0) {
    return false;
  }
  if (!candidate.user || typeof candidate.user !== "object") return false;
  const user = candidate.user as { id?: unknown; email?: unknown; name?: unknown };
  return (
    typeof user.id === "string" &&
    user.id.length > 0 &&
    typeof user.email === "string" &&
    user.email.length > 0 &&
    (user.name === undefined || user.name === null || typeof user.name === "string")
  );
}

function isOAuthProviderId(value: string): value is OAuthProviderId {
  return value === "google" || value === "azure-ad";
}

function getProfileString(profile: Profile | undefined, key: string): string | null {
  const value = profile && (profile as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function exchangeOAuthIdentity(input: {
  provider: OAuthProviderId;
  providerAccountId: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
}): Promise<OAuthExchangeResult> {
  const bridgeSecret = process.env.OAUTH_BRIDGE_SECRET;
  if (!bridgeSecret?.trim()) {
    return { ok: false, code: "OAuthUnavailable" };
  }

  try {
    const response = await fetch(`${backendUrl}/api/auth/oauth/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridgeSecret}`,
      },
      body: JSON.stringify(input),
    });

    const payload = (await response.json().catch(() => null)) as (Partial<BackendAuthResponse> & { code?: string }) | null;
    if (response.ok && isBackendAuthResponse(payload)) {
      return { ok: true, data: payload as BackendAuthResponse };
    }

    if (response.status === 409 || payload?.code === "OAUTH_EMAIL_CONFLICT") {
      return { ok: false, code: "OAuthEmailConflict" };
    }
    if (response.status === 400 && payload?.code === "OAUTH_EMAIL_UNVERIFIED") {
      return { ok: false, code: "OAuthEmailUnverified" };
    }
    if (response.status === 400 && payload?.code === "OAUTH_INVALID_IDENTITY") {
      return { ok: false, code: "OAuthEmailRequired" };
    }
    return { ok: false, code: "OAuthUnavailable" };
  } catch {
    return { ok: false, code: "OAuthUnavailable" };
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json().catch(() => null)) as unknown;
      if (!isBackendAuthResponse(data)) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        token: data.token,
        tokenExpiresAt: data.tokenExpiresAt,
      };
    },
  }),
];

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: { params: { prompt: "select_account", scope: "openid email profile" } },
    })
  );
}

const azureClientId = process.env.AZURE_AD_CLIENT_ID?.trim();
const azureClientSecret = process.env.AZURE_AD_CLIENT_SECRET?.trim();
if (azureClientId && azureClientSecret) {
  providers.push(
    AzureADProvider({
      clientId: azureClientId,
      clientSecret: azureClientSecret,
      tenantId: process.env.AZURE_AD_TENANT_ID?.trim() || "common",
      authorization: { params: { prompt: "select_account", scope: "openid email profile" } },
      profile(profile) {
        return {
          id: profile.sub,
          name: typeof profile.name === "string" ? profile.name : null,
          email: typeof profile.email === "string" ? profile.email : null,
          image: null,
        };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: APP_SESSION_TTL_SECONDS,
  },
  jwt: {
    maxAge: APP_SESSION_TTL_SECONDS,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.type !== "oauth") {
        return true;
      }

      if (!isOAuthProviderId(account.provider)) {
        return "/login?error=OAuthUnavailable";
      }

      const providerAccountId = typeof account.providerAccountId === "string" ? account.providerAccountId.trim() : null;
      const email = getProfileString(profile, "email")?.toLowerCase();
      const name = getProfileString(profile, "name");
      const emailVerified = (profile as Record<string, unknown> | undefined)?.email_verified === true;

      if (!providerAccountId || !email) {
        return "/login?error=OAuthEmailRequired";
      }
      if (account.provider === "google" && !emailVerified) {
        return "/login?error=OAuthEmailUnverified";
      }

      const exchange = await exchangeOAuthIdentity({
        provider: account.provider,
        providerAccountId,
        email,
        name,
        emailVerified,
      });

      if (!exchange.ok) {
        return `/login?error=${exchange.code}`;
      }

      Object.assign(user as User & { token?: string; tokenExpiresAt?: number }, {
        id: exchange.data.user.id,
        email: exchange.data.user.email,
        name: exchange.data.user.name,
        token: exchange.data.token,
        tokenExpiresAt: exchange.data.tokenExpiresAt,
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as User & { token?: string; tokenExpiresAt?: number };
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          token: customUser.token,
          tokenExpiresAt: customUser.tokenExpiresAt,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const customToken = token as typeof token & { token?: string; tokenExpiresAt?: number };
        session.user.id = typeof token.id === "string" ? token.id : undefined;
        session.user.email = typeof token.email === "string" ? token.email : undefined;
        session.user.name = typeof token.name === "string" ? token.name : null;
        session.user.token = customToken.token;
        session.user.tokenExpiresAt = customToken.tokenExpiresAt;
        if (typeof customToken.tokenExpiresAt === "number" && Date.now() >= customToken.tokenExpiresAt * 1000) {
          session.error = "SessionExpired";
        }
      }
      return session;
    },
  },
};
