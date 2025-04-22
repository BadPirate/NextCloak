import { verify } from 'argon2'
import { getAppDataSource } from '../AppDataSource'
import CredentialsEntity from '../entities/CredentialsEntity'
import logger from '../logger'

async function credentialAuthorize(credentials: Record<'username' | 'password', string> | undefined) {
  if (!credentials?.username || !credentials?.password) {
    // Missing credentials: fail sign in
    logger.info('Missing username or password in credentials provider')
    return null
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
    // Invalid username: fail sign in
    return null
  }

  // 🔑 Compare the provided password with the stored hash
  const isValidPassword = await verify(storedCredential.hashedPassword, credentials.password)

  if (!isValidPassword) {
    logger.info('Invalid password for username', credentials.username)
    // Invalid password: fail sign in
    return null
  }

  logger.info(`User ${storedCredential.user.email} authenticated via credentials`)

  return storedCredential.user
}

export default credentialAuthorize
