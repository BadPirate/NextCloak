import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  export interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
