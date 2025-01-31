import NextAuth, { NextAuthOptions } from "next-auth"
import Email from "next-auth/providers/email"
import { TypeORMAdapter } from "@auth/typeorm-adapter"
import jwt from "jsonwebtoken"
import { JWT } from "next-auth/jwt"
import { authTypeORMConnection } from "../../../src/AppDataSource"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}


export const authOptions: NextAuthOptions = {
  providers: [
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: TypeORMAdapter(authTypeORMConnection),
  session: {
    strategy: "database",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.email = user.email
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    encode: async ({ secret, token, maxAge }) => {
      if (!token) {
        throw new Error("Token is undefined")
      }
      return jwt.sign(token, secret, { algorithm: "HS256", expiresIn: maxAge })
    },
    decode: async ({ secret, token }) => {
      if (!token) {
        throw new Error("Token is undefined")
      }
      try {
        return jwt.verify(token, secret) as JWT
      } catch (error) {
        return null
      }
    },
  },
}

export default NextAuth(authOptions)