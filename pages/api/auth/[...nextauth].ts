import NextAuth, { NextAuthOptions } from 'next-auth'
import Email from 'next-auth/providers/email'
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
  session: { strategy: 'database' },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: { maxAge: 30 * 24 * 60 * 60 },
}

export default (req: NextApiRequest, res: NextApiResponse) => {
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
        const { user } = context

        if (nextauth.includes('callback') && nextauth.includes('credentials') && req.method === 'POST') {
          if (user) {
            const sessionToken = randomUUID()
            const maxAge = authOptions.session?.maxAge ?? 2592000
            const sessionExpiry = new Date(Date.now() + maxAge * 1000)

            await adapter.createSession!({
              sessionToken,
              userId: user.id,
              expires: sessionExpiry,
            })

            const cookies = new Cookies(req, res)

            cookies.set('next-auth.session-token', sessionToken, {
              expires: sessionExpiry,
            })
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
  return NextAuth(req, res, options)
}
