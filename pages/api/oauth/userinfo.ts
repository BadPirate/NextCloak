import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { entities } from '@auth/typeorm-adapter'
import { getAppDataSource } from '../../../src/AppDataSource'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ 1. Extract Bearer Token from Authorization Header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const accessToken = authHeader.split(' ')[1] // Extract token from `Bearer <TOKEN>`

  try {
    // ✅ 2. Verify & Decode JWT (Ensure Signature is Valid)
    const decodedToken = jwt.verify(accessToken, authOptions.secret as string) as jwt.JwtPayload

    if (!decodedToken.sub) {
      return res.status(401).json({ error: 'Invalid token (missing sub)' })
    }

    // ✅ 3. Fetch User From Database (Optional but Recommended)
    const dataSource = await getAppDataSource()
    const userRepo = dataSource.getRepository(entities.UserEntity)
    const user = await userRepo.findOne({ where: { id: decodedToken.sub } })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // ✅ 4. Return User Info (Following OpenID Standard)
    return res.json({
      sub: user.id, // OAuth "sub" claim
      name: user.name,
      email: user.email,
      picture: user.image || null, // Optional
      scope: decodedToken.scope,
    })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
