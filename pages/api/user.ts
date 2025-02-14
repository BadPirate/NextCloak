import { hash } from 'argon2'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { entities } from '@auth/typeorm-adapter'
import { authOptions } from './auth/[...nextauth]'
import { getAppDataSource } from '../../src/AppDataSource'
import CredentialsEntity from '../../src/entities/CredentialsEntity'
import logger from '../../src/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const AppDataSource = await getAppDataSource()

  // ✅ Get repositories
  const UserRepo = AppDataSource.getRepository(entities.UserEntity)
  const CredentialsRepo = AppDataSource.getRepository(CredentialsEntity)

  if (req.method === 'PATCH') {
    const { name, password } = req.body

    try {
      // Update Name (if provided)
      if (name) {
        if (name.length < 3) {
          return res.status(400).json({ error: 'Invalid name' })
        }
        await UserRepo.update({ id: session.user.id }, { name })
        logger.info('Updated name for user:', session.user)
      }

      // Update Password (if provided)
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters' })
        }

        // Hash the new password
        const hashedPassword = await hash(password)

        const userId = await UserRepo.findOne({ where: { email: session.user.email } })
          .then((user) => user?.id)
        if (!userId) { throw new Error('User not found') }
        CredentialsRepo.upsert({ userId, hashedPassword }, ['userId'])
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      logger.info('Database Error:', error)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' })
}
