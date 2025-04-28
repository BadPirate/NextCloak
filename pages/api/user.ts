import { hash } from 'argon2'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { entities } from '@auth/typeorm-adapter'
import { getAppDataSource } from '../../src/AppDataSource'
import CredentialsEntity from '../../src/entities/CredentialsEntity'
import logger from '../../src/logger'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user || !session.user.email) {
    res.status(401).json({ error: 'Unauthorized' })
    return
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
          res.status(400).json({ error: 'Invalid name' })
          return
        }
        await UserRepo.update({ id: session.user.id }, { name })
        logger.info('Updated name for user:', session.user)
      }

      // Update Password (if provided)
      if (password) {
        if (password.length < 6) {
          res.status(400).json({ error: 'Password must be at least 6 characters' })
          return
        }

        // Hash the new password
        const hashedPassword = await hash(password)

        const userId = await UserRepo.findOne({ where: { email: session.user.email } }).then(
          (user) => user?.id,
        )
        if (!userId) {
          throw new Error('User not found')
        }
        CredentialsRepo.upsert({ userId, hashedPassword }, ['userId'])
      }

      res.status(200).json({ success: true })
      return
    } catch (error) {
      logger.info('Database Error:', error)
      res.status(500).json({ error: 'Database error' })
      return
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' })
}
