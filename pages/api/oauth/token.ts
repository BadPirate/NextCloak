/* eslint-disable camelcase */
import { NextApiRequest, NextApiResponse } from 'next'
import { getAppDataSource } from '../../../src/AppDataSource'
import OAuthAuthorizationCodeEntity from '../../../src/entities/OAuthAuthorizationCodeEntity'
import logger from '../../../src/logger'
import { base64Sha256 } from '../../../src/base64UrlEncode'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  let { client_secret, client_id } = req.body
  const {
    grant_type, code, redirect_uri, code_verifier,
  } = req.body

  // If no client secret in body then try to get it from headers
  if (!client_secret) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1]
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
      const [id, secret] = credentials.split(':')
      client_id = id
      client_secret = secret
    } else {
      return res.status(400).json({ error: 'No client secret provided' })
    }
  }

  // ✅ 1. Validate Request Parameters
  if (!grant_type || !code || !redirect_uri || !code_verifier) {
    return res.status(400).json({ error: 'Invalid request parameters' })
  }

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'Invalid grant_type' })
  }

  const dataSource = await getAppDataSource()
  const oauthCodeRepo = dataSource.getRepository(OAuthAuthorizationCodeEntity)

  const expectedSecret = base64Sha256(client_id + authOptions.secret)

  if (expectedSecret !== client_secret) {
    logger.info(`Invalid client secret for ${client_id}, expected: ${expectedSecret}, got: ${client_secret}`)
    return res.status(400).json({ error: 'Invalid client secret' })
  }

  // ✅ 2. Find Authorization Code in Database
  const authCodeEntry = await oauthCodeRepo.findOne({ where: { code } })
  if (!authCodeEntry) {
    return res.status(400).json({ error: 'Invalid authorization code' })
  }

  // ✅ 3. Validate Redirect URI (Ensure it matches the stored one)
  if (authCodeEntry.redirectUri !== redirect_uri) {
    return res.status(400).json({ error: 'redirect_uri mismatch' })
  }

  // ✅ 4. Validate PKCE Code Verifier
  const hashedVerifier = base64Sha256(code_verifier)

  if (hashedVerifier !== authCodeEntry.codeChallenge) {
    logger.info('PKCE code_verifier mismatch', { hashedVerifier, challenge: authCodeEntry.codeChallenge })
    return res.status(400).json({ error: 'Invalid PKCE code_verifier' })
  }

  // ✅ 5. Delete Used Authorization Code (One-time use)
  await oauthCodeRepo.delete({ code })

  // ✅ 6. Return Access Token
  return res.json({
    access_token: authCodeEntry.accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
  })
}
