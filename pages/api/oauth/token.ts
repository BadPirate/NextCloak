/* eslint-disable camelcase */
import { NextApiRequest, NextApiResponse } from 'next'
import { getAppDataSource } from '../../../src/AppDataSource'
import OAuthAuthorizationCodeEntity from '../../../src/entities/OAuthAuthorizationCodeEntity'
import logger from '../../../src/logger'
import { base64Sha256 } from '../../../src/base64UrlEncode'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let { client_secret, client_id } = req.body
  const { grant_type, code, redirect_uri, code_verifier } = req.body

  if (!client_secret) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1]
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
      const [id, secret] = credentials.split(':')
      client_id = id
      client_secret = secret
    } else {
      res.status(400).json({ error: 'No client secret provided' })
      return
    }
  }

  if (!grant_type || !code || !redirect_uri || !code_verifier) {
    res.status(400).json({ error: 'Invalid request parameters' })
    return
  }

  if (grant_type !== 'authorization_code') {
    res.status(400).json({ error: 'Invalid grant_type' })
    return
  }

  const dataSource = await getAppDataSource()
  const oauthCodeRepo = dataSource.getRepository(OAuthAuthorizationCodeEntity)

  const expectedSecret = base64Sha256(client_id + authOptions.secret)

  if (expectedSecret !== client_secret) {
    logger.info(
      `Invalid client secret for ${client_id}, expected: ${expectedSecret}, got: ${client_secret}`,
    )
    res.status(400).json({ error: 'Invalid client secret' })
    return
  }

  const authCodeEntry = await oauthCodeRepo.findOne({ where: { code } })
  if (!authCodeEntry) {
    res.status(400).json({ error: 'Invalid authorization code' })
    return
  }

  if (authCodeEntry.redirectUri !== redirect_uri) {
    res.status(400).json({ error: 'redirect_uri mismatch' })
    return
  }

  const hashedVerifier = base64Sha256(code_verifier)

  if (hashedVerifier !== authCodeEntry.codeChallenge) {
    logger.info('PKCE code_verifier mismatch', {
      hashedVerifier,
      challenge: authCodeEntry.codeChallenge,
    })
    res.status(400).json({ error: 'Invalid PKCE code_verifier' })
    return
  }

  await oauthCodeRepo.delete({ code })

  res.json({
    id_token: authCodeEntry.token,
    token_type: 'Bearer',
    expires_in: 3600,
  })
}
