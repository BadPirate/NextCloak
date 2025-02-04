/* eslint-disable camelcase */
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import jwt from 'jsonwebtoken'
import { authOptions } from '../auth/[...nextauth]'
import { getAppDataSource } from '../../../src/AppDataSource'
import generateRandomString from '../../../src/generateRandomString'
import OAuthAuthorizationCodeEntity from '../../../src/entities/OAuthAuthorizationCodeEntity'
import logger from '../../../src/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    client_id, redirect_uri, response_type, state, code_challenge, code_challenge_method,
  } = req.query

  // ✅ 1. Validate Request Parameters
  if (!client_id || !redirect_uri || !response_type || !code_challenge || !code_challenge_method) {
    return res.status(400).json({ error: 'Invalid request parameters' })
  }

  if (response_type !== 'code') {
    return res.status(400).json({ error: 'Invalid response_type' })
  }

  // ✅ 2. Normalize and Validate PKCE Challenge Method (Case-Insensitive)
  if (typeof code_challenge_method === 'string' && code_challenge_method.toLowerCase() !== 's256') {
    return res.status(400).json({ error: 'Only PKCE S256 is supported' })
  }

  // ✅ 3. Validate Redirect URI using Environment Variable Regex
  const redirectRegex = process.env.REDIRECT_REGEX
  if (redirectRegex) {
    const regex = new RegExp(redirectRegex)
    if (!regex.test(redirect_uri as string)) {
      return res.status(400).json({ error: 'Invalid redirect URI' })
    }
  }

  logger.info(`OAuth request from client ${client_id}, redirecting to ${redirect_uri}`)

  // ✅ 4. Check If User is Authenticated
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
  // Redirect to NextAuth sign-in, passing `callbackUrl` to bring them back after login
    const reqUrl = req.url
    if (!reqUrl) { throw new Error('Missing req.url') }
    return res.redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(reqUrl)}`)
  }

  // ✅ 5. Generate Secure Authorization Code
  const authorizationCode = generateRandomString(32) // Secure random code

  // ✅ 6. Generate JWT

  const accessToken = jwt.sign(
    {
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      client_id,
      aud: redirect_uri, // Allow client to only accept their tokens
      token_type: 'oauth_access_token',
    },
    authOptions.secret as string,
    { expiresIn: authOptions.jwt?.maxAge || (30 * 24 * 60 * 60) },
  )

  // ✅ 7. Store Authorization Code Securely
  const dataSource = await getAppDataSource()
  const oauthCodeRepo = dataSource.getRepository(OAuthAuthorizationCodeEntity)

  const newAuthCode = oauthCodeRepo.create({
    code: authorizationCode,
    redirectUri: Array.isArray(redirect_uri) ? redirect_uri[0] : redirect_uri,
    codeChallenge: (code_challenge as string).trim(), // Stored in SHA-256 format
    accessToken,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Code expires in 10 minutes
  })

  await oauthCodeRepo.save(newAuthCode)

  // ✅ 8. Redirect to Client with Authorization Code
  return res.redirect(`${redirect_uri}?code=${authorizationCode}&state=${state}`)
}
