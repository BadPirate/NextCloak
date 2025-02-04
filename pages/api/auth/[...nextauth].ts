import NextAuth, { NextAuthOptions } from 'next-auth'
import Email from 'next-auth/providers/email'
import { TypeORMAdapter } from '@auth/typeorm-adapter'
import Credentials from 'next-auth/providers/credentials'
import AppDataSource from '../../../src/AppDataSource'
import credentialAuthorize from '../../../src/auth/credentialAuthorize'

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text', placeholder: 'Email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: credentialAuthorize,
    }),
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: TypeORMAdapter(AppDataSource.options),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      return {
        ...token,
        id: user?.id || token.id,
      }
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      }
    },
  },
}

export default NextAuth(authOptions)
