import NextAuth, { NextAuthOptions } from 'next-auth'
import Email from 'next-auth/providers/email'
import { TypeORMAdapter } from '@auth/typeorm-adapter'
import Credentials from 'next-auth/providers/credentials'
import { verify } from 'argon2'
import AppDataSource, { getAppDataSource } from '../../../src/AppDataSource'
import CredentialsEntity from '../../../src/entities/CredentialsEntity'
import logger from '../../../src/logger'

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing username or password')
        }

        const dataSource = await getAppDataSource()
        const credentialsRepo = dataSource.getRepository(CredentialsEntity)

        // 🔍 Find the credentials by username
        const storedCredential = await credentialsRepo.findOne({
          where: { username: credentials.username },
          relations: ['user'], // Ensure user data is also loaded
        })

        if (!storedCredential) {
          logger.info('Credentials not found for username', credentials.username)
          throw new Error('Invalid username or password')
        }

        // 🔑 Compare the provided password with the stored hash
        const isValidPassword = await verify(storedCredential.hashedPassword, credentials.password)

        if (!isValidPassword) {
          logger.info('Invalid password for username', credentials.username)
          throw new Error('Invalid username or password')
        }

        logger.info('✅ Credential authentication successful for', credentials.username)

        return {
          id: storedCredential.user.id,
          name: storedCredential.user.name,
          email: storedCredential.user.email,
        }
      },
    }),
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: TypeORMAdapter(AppDataSource.options), // ✅ Use `.options`, not the full DataSource
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            email: token.email,
          },
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
}

export default NextAuth(authOptions)
