import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

const nextAuthSecret = process.env.NEXTAUTH_SECRET as string
if (!nextAuthSecret) {
  throw new Error('NEXTAUTH_SECRET environment variable is not defined')
}

interface DecodedToken {
  id: string
  email: string
  name: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1] // Extract token from "Bearer <token>"

  try {
    const decoded = jwt.verify(token, nextAuthSecret) as unknown as DecodedToken
    res.status(200).json({
      sub: decoded.id,
      email: decoded.email,
      name: decoded.name,
      profile: `https://auth.example.com/api/avatar/${decoded.id}`,
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
