/* eslint-disable camelcase */
import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { getAppDataSource } from '../../../src/AppDataSource'
import OAuthAuthorizationCodeEntity from '../../../src/entities/OAuthAuthorizationCodeEntity'
import logger from '../../../src/logger'
import base64UrlEncode from '../../../src/base64UrlEncode'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const {
    grant_type, code, redirect_uri, client_id, code_verifier,
  } = req.body

  logger.info(`OAuth token request from client ${client_id}`)

  // ✅ 1. Validate Request Parameters
  if (!grant_type || !code || !redirect_uri || !code_verifier) {
    return res.status(400).json({ error: 'Invalid request parameters' })
  }

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'Invalid grant_type' })
  }

  const dataSource = await getAppDataSource()
  const oauthCodeRepo = dataSource.getRepository(OAuthAuthorizationCodeEntity)

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
  const hashedVerifier = base64UrlEncode(
    crypto.createHash('sha256').update(code_verifier, 'utf-8').digest(),
  )

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
