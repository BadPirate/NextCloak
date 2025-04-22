import NextAuth, { NextAuthOptions } from 'next-auth'
import Email from 'next-auth/providers/email'
import Google from 'next-auth/providers/google'
import { TypeORMAdapter } from '@auth/typeorm-adapter'
import Credentials from 'next-auth/providers/credentials'
import { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { decode, encode } from 'next-auth/jwt'
import Cookies from 'cookies'
import credentialAuthorize from '../../../src/auth/credentialAuthorize'
import AppDataSource from '../../../src/AppDataSource'

export const authOptions: NextAuthOptions = {
  providers: [
    // OAuth providers first
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Email provider second
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    // Credentials provider last
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text', placeholder: 'Email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: credentialAuthorize,
    }),
  ],
  // Override the built-in error page to display custom UI
  pages: {
    error: '/auth/error',
  },
  adapter: TypeORMAdapter(AppDataSource.options),
  session: { strategy: 'database' },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: { maxAge: 30 * 24 * 60 * 60 },
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { nextauth } = req.query
  const { adapter } = authOptions
  if (!nextauth || !adapter) throw new Error('Invalid request')

  const options: NextAuthOptions = {
    ...authOptions,
    jwt: {
      encode: async (context) => {
        const { token, secret, maxAge } = context
        if (nextauth.includes('callback') && nextauth.includes('credentials') && req.method === 'POST') {
          const cookies = new Cookies(req, res)
          const cookie = cookies.get('next-auth.session-token')
          return cookie ?? ''
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return encode({ token, secret, maxAge })
      },
      decode: async (context) => {
        const { token, secret } = context
        if (nextauth.includes('callback') && nextauth.includes('credentials') && req.method === 'POST') {
          return null
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return decode({ token, secret })
      },
    },
    callbacks: {
      signIn: async (context) => {
        const { user, account } = context
        // Credentials provider flow: set session cookie manually
        if (nextauth.includes('callback') && nextauth.includes('credentials') && req.method === 'POST') {
          if (user) {
            const sessionToken = randomUUID()
            const maxAge = authOptions.session?.maxAge ?? 2592000
            const sessionExpiry = new Date(Date.now() + maxAge * 1000)
            await adapter.createSession!({ sessionToken, userId: user.id, expires: sessionExpiry })
            new Cookies(req, res).set('next-auth.session-token', sessionToken, { expires: sessionExpiry })
          }
        }
        // Link Google accounts by email to existing user records
        if (account?.provider === 'google' && user.email) {
          // Try to find an existing user by email
          const existingUser = await adapter.getUserByEmail!(user.email)
          if (existingUser && existingUser.id !== user.id) {
            // Link the new Google account to the existing user
            await adapter.linkAccount!({
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: 'oauth',
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              id_token: account.id_token,
            })
            // Override session user id to the existing user's id
            context.user.id = existingUser.id
          }
        }
        return true
      },
      session: async (context) => {
        const { session, user } = context
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
          },
        }
      },
    },
  }
  await NextAuth(options)(req, res)
}
