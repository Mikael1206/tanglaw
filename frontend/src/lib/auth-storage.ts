import { AUTH_TOKEN_KEY } from "./auth-constants";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  try {
    return storage()?.getItem(AUTH_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): boolean {
  const localStorage = storage();
  if (!localStorage) return false;
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return localStorage.getItem(AUTH_TOKEN_KEY) === token;
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return true;
    }
  } catch {
    // Private browsing and blocked storage must not break the auth flow.
    return false;
  }
}
