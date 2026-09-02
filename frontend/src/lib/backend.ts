import { BACKEND_UNAUTHORIZED_EVENT } from "./auth-constants";
import { getAuthToken, setAuthToken } from "./auth-storage";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/+$/, "");

if (!backendUrl) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL in frontend environment");
}

const apiBase = `${backendUrl}/api`;
export interface BackendScholarship {
  id: string;
  name: string;
  provider: string;
  type: "Public" | "Private";
  incomeBracket: number;
  minGwa: number;
  programCategories: string[];
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
  name?: string | null;
}

export interface BackendQuestion {
  id: number;
  subject: "Mathematics" | "Science" | "English" | "Filipino" | "Logical Reasoning";
  difficulty: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

const SUBJECT_TO_QUESTION_TYPE: Record<string, string> = {
  Mathematics: "MATH",
  Science: "SCIENCE",
  English: "ENGLISH",
  Filipino: "FILIPINO",
  "Logical Reasoning": "LOGIC",
};

async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });
  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(BACKEND_UNAUTHORIZED_EVENT));
      }
      throw new Error("Your session has expired. Please sign in again.");
    }
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
  return payload.user;
}

export async function logoutUser(): Promise<void> {
  await authorizedFetch(`${apiBase}/auth/logout`, {
    method: "POST",
  });
  setAuthToken(null);
}

export async function getCurrentUser(): Promise<BackendUser> {
  const payload = await authorizedFetch(`${apiBase}/auth/me`);
  return payload.user;
}

export async function fetchScholarships(): Promise<BackendScholarship[]> {
  const payload = await authorizedFetch(`${apiBase}/scholarships?pageSize=100`);
  return payload.data ?? [];
}

export async function fetchQuestions(params: {
  mode: "diagnostic" | "mock";
  subjects?: string[];
  difficulty?: number[];
  count?: number;
}): Promise<BackendQuestion[]> {
  const query = new URLSearchParams({ mode: params.mode });
  if (params.subjects?.length) {
    query.set("subjects", params.subjects.map((subject) => SUBJECT_TO_QUESTION_TYPE[subject] ?? subject).join(","));
  }
  if (params.difficulty?.length) {
    query.set("difficulty", params.difficulty.join(","));
  }
  if (params.count) {
    query.set("count", String(params.count));
  }

  const payload = await authorizedFetch(`${apiBase}/questions?${query.toString()}`);
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

export async function sendChatMessage(question: string): Promise<{ answer: string; remaining?: number; limit?: number; code?: string }> {
  return authorizedFetch(`${apiBase}/chat`, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}
