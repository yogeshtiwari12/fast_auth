import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.BACKEND_SERVER}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await response.json();
          if (response.ok && data.access_token) {
            // Return a properly structured user object
            return {
              id: data.id,
              email: credentials?.email,
              name: data.name || credentials?.email,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      // Handle Credentials provider
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.email = user?.email;
        token.name = user?.name;
        token.userId = user?.id;
      }
      if (trigger === 'update') {
        return { ...token, ...session.user }
      }

      return token;
    },
    async session({ session, token }) {
      // Ensure session user object is properly structured
      session.user = {
        ...session.user,
        email: token.email,
        name: token.name,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        id: token.userId as string,
      } as any;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
