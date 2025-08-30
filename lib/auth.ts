import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { api } from "./api"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[v0] Missing credentials")
          return null
        }

        try {
          console.log("[v0] Attempting login with:", credentials.email)
          const response = await api.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          })

          console.log("[v0] API response:", response.data)

          if (response.data.success) {
            const { data } = response.data
            console.log("[v0] Login successful, user data:", data)
            return {
              id: data.userId,
              email: data.email,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }
          }
          console.log("[v0] Login failed - API returned success: false")
          return null
        } catch (error) {
          console.error("[v0] Authentication error:", error)
          if (error.response) {
            console.error("[v0] API Error Response:", error.response.data)
            console.error("[v0] API Error Status:", error.response.status)
          } else if (error.request) {
            console.error("[v0] Network Error - No response received")
          } else {
            console.error("[v0] Request setup error:", error.message)
          }
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.userId as string
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}
