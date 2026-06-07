const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL in frontend environment");
}

const apiBase = `${backendUrl}/api`;
const AUTH_TOKEN_KEY = "tanglaw-token";

export interface BackendScholarship {
  id: string;
  name: string;
  provider: string;
  type: "Public" | "Private";
  incomeBracket: number;
  program: string;
  benefits: string[];
  requirements: string[];
  link: string;
}

export interface BackendMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  metadata?: unknown;
}

export interface BackendMessagePayload {
  role: string;
  content: string;
  metadata?: unknown;
}

export interface BackendUser {
  id: string;
  email: string;
  name?: string;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed ${response.status}: ${response.statusText} ${errorText}`);
  }

  return response.json();
}

export async function signupAccount(fullName: string, email: string, password: string): Promise<BackendUser> {
  const response = await fetch(`${apiBase}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Signup failed: ${response.status} ${response.statusText} ${errorText}`);
  }

  const payload = await response.json();
  setStoredToken(payload.token);
  return payload.user;
}

export async function loginUser(email: string, password: string): Promise<BackendUser> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status} ${response.statusText} ${errorText}`);
  }

  const payload = await response.json();
  setStoredToken(payload.token);
  return payload.user;
}

export async function logoutUser(): Promise<void> {
  await authorizedFetch(`${apiBase}/auth/logout`, {
    method: "POST",
  });
  setStoredToken(null);
}

export async function getCurrentUser(): Promise<BackendUser> {
  const payload = await authorizedFetch(`${apiBase}/auth/me`);
  return payload.user;
}

export async function fetchScholarships(): Promise<BackendScholarship[]> {
  const payload = await authorizedFetch(`${apiBase}/scholarships`);
  return payload.data ?? [];
}

export async function getChatMessages(): Promise<BackendMessage[]> {
  return authorizedFetch(`${apiBase}/messages`);
}

export async function createChatMessage(payload: BackendMessagePayload): Promise<BackendMessage> {
  return authorizedFetch(`${apiBase}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendChatMessage(question: string): Promise<{ answer: string }> {
  return authorizedFetch(`${apiBase}/chat`, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}
