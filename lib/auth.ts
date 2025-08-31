import type { AuthOptions } from "next-auth"; // Use AuthOptions instead of NextAuthOptions
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        try {
          const response = await axios.post(`${baseURL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data.success) {
            const { data } = response.data;

            // Ensure the response matches the User interface from types/next-auth.d.ts
            return {
              id: data.userId,
              email: data.email,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              role: data.role,
            };
          }
          console.log("[Auth] Login failed: No success response");
          return null;
        } catch (error: any) {
          console.error("[Auth] Authentication error:", error?.response?.data?.message || error?.message);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // User is available during initial sign-in
      if (user) {
        token.userId = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Populate session.user with custom properties
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.role = token.role ?? "";
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET, // Required for JWT strategy
  debug: process.env.NODE_ENV === "development",
};