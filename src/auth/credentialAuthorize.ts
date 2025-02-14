import { verify } from 'argon2'
import { getAppDataSource } from '../AppDataSource'
import CredentialsEntity from '../entities/CredentialsEntity'
import logger from '../logger'

async function credentialAuthorize(credentials: Record<'username' | 'password', string> | undefined) {
  if (!credentials?.username || !credentials?.password) {
    throw new Error('Missing username or password')
  }

  const dataSource = await getAppDataSource()
  const credentialsRepo = dataSource.getRepository(CredentialsEntity)

  // 🔍 Find the credentials by username
  const storedCredential = await credentialsRepo.findOne({
    where: { user: { email: credentials.username } },
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

  logger.info(`User ${storedCredential.user.email} authenticated via credentials`)

  return storedCredential.user
}

export default credentialAuthorize
