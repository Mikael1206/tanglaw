import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    token?: string;
    tokenExpiresAt?: number;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      token?: string;
      tokenExpiresAt?: number;
    };
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    token?: string;
    tokenExpiresAt?: number;
  }
}
