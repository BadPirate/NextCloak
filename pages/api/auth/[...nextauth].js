import NextAuth from "next-auth"
import Email from "next-auth/providers/email"
import { TypeORMAdapter } from "@auth/typeorm-adapter"
import jwt from "jsonwebtoken"

export const authOptions = {
  providers: [
    Email({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM
    }),
  ],
  adapter: TypeORMAdapter(process.env.AUTH_TYPEORM_CONNECTION),
  session: {
    strategy: "database", // Store session in the database
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
    async session({ session, token }) {
      session.user.id = token.id
      session.user.email = token.email
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    encode: async ({ secret, token }) => {
      return jwt.sign(token, secret, { algorithm: "HS256" })
    },
    decode: async ({ secret, token }) => {
      return jwt.verify(token, secret)
    },
  },
}

export default NextAuth(authOptions)