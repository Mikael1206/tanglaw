export const APP_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const AUTH_TOKEN_KEY = "tanglaw-token";
export const SESSION_EXPIRED_ERROR = "SessionExpired";
export const BACKEND_UNAUTHORIZED_EVENT = "tanglaw-backend-unauthorized";

export const DEFAULT_AUTH_ERROR_MESSAGE = "Unable to sign in. Please try again.";

/** Fixed, user-safe messages for every auth failure we expose in the UI. */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthEmailConflict: "This email already has a TANGLAW account. Sign in with its original method.",
  OAuthAccountNotLinked: "This email already has a TANGLAW account. Sign in with its original method.",
  OAuthEmailRequired: "The provider did not return an email address. Choose another account or sign-in method.",
  OAuthEmailUnverified: "Google must confirm this email address before TANGLAW can use it.",
  OAuthUnavailable: "Social sign-in is temporarily unavailable. You can still use your email and password.",
  OAuthSignin: "Social sign-in could not be started. Please try again.",
  OAuthCallback: "Social sign-in was canceled or could not be completed. Please try again.",
  OAuthCreateAccount: "Social sign-in could not create your TANGLAW account. Please try again.",
  AccessDenied: "Social sign-in was canceled or denied. Please try again.",
  Configuration: "Social sign-in is not configured correctly. You can still use your email and password.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to continue.",
  SessionExpired: "Your session has expired. Please sign in again to continue.",
};

export function getAuthErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_AUTH_ERROR_MESSAGE;
}
