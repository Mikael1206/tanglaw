import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? "development-secret";

if (!backendUrl) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL environment variable for NextAuth.");
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  providers: [
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

        const data = await response.json();
        if (!data?.token || !data?.user) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          token: data.token,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as typeof user & { token?: string };
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          token: customUser.token,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.token = (token as typeof token & { token?: string }).token as string;
      }
      return session;
    },
  },
};
