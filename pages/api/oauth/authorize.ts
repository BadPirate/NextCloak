/* eslint-disable camelcase */
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import jwt from 'jsonwebtoken'
import { entities } from '@auth/typeorm-adapter'
import { authOptions } from '../auth/[...nextauth]'
import { getAppDataSource } from '../../../src/AppDataSource'
import generateRandomString from '../../../src/generateRandomString'
import OAuthAuthorizationCodeEntity from '../../../src/entities/OAuthAuthorizationCodeEntity'
import logger from '../../../src/logger'
import rsaKeypair from '../../../src/auth/rsaKeypair'

const authorizeHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    state,
    code_challenge,
    code_challenge_method,
    scope,
  } = req.query

  if (!client_id || !redirect_uri || !response_type || !code_challenge || !code_challenge_method) {
    throw new Error('Missing required parameters')
  }

  if (response_type !== 'code') {
    throw new Error('Invalid response_type')
  }

  if (typeof code_challenge_method === 'string' && code_challenge_method.toLowerCase() !== 's256') {
    throw new Error('Only PKCE S256 is supported')
  }

  const redirectRegex = process.env.REDIRECT_REGEX
  if (redirectRegex) {
    const regex = new RegExp(redirectRegex)
    if (!regex.test(redirect_uri as string)) {
      throw new Error('Invalid redirect_uri')
    }
  }

  logger.info(`OAuth request from client ${client_id}, redirecting to ${redirect_uri}`)

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user || !session.user.email) {
    const reqUrl = req.url
    if (!reqUrl) {
      throw new Error('Missing req.url')
    }
    res.redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(reqUrl)}`)
    return
  }

  const authorizationCode = generateRandomString(32) // Secure random code

  const appDataSource = await getAppDataSource()
  const userRepo = appDataSource.getRepository(entities.UserEntity)
  const userId = await userRepo
    .findOne({ where: { email: session.user.email } })
    .then((user) => user?.id)
  if (!userId) {
    throw new Error('User not found')
  }

  const payload: {
    sub: string
    client_id: string
    aud: string
    scope: string
    iss: string
    email?: string
    name?: string | null
    picture?: string | null
  } = {
    sub: userId,
    client_id: client_id as string,
    aud: client_id as string,
    scope: (scope as string) || 'openid email profile',
    iss: `${process.env.NEXTAUTH_URL}`,
  }

  if (scope && scope.includes('email') && session.user.email) {
    payload.email = session.user.email
  }

  if (scope && scope.includes('profile')) {
    payload.name = session.user.name
    payload.picture = session.user.image
  }

  const token = jwt.sign(payload, rsaKeypair.privateKey, {
    algorithm: 'RS256',
    expiresIn: authOptions.jwt?.maxAge || 30 * 24 * 60 * 60,
  })

  const dataSource = await getAppDataSource()
  const oauthCodeRepo = dataSource.getRepository(OAuthAuthorizationCodeEntity)

  const newAuthCode = oauthCodeRepo.create({
    code: authorizationCode,
    redirectUri: Array.isArray(redirect_uri) ? redirect_uri[0] : redirect_uri,
    codeChallenge: (code_challenge as string).trim(), // Stored in SHA-256 format
    token,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Code expires in 10 minutes
  })

  await oauthCodeRepo.save(newAuthCode)

  res.redirect(`${redirect_uri}?code=${authorizationCode}&state=${state}`)
}

export default authorizeHandler
