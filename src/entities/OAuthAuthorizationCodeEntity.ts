import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm'

  @Entity('oauth_authorization_codes')
export default class OAuthAuthorizationCodeEntity {
    @PrimaryGeneratedColumn()
      id: number

    @Column({ unique: true }) // ✅ Ensure 'code' is correctly stored
      code: string // The authorization code

    @Column()
      redirectUri: string // Must match the client's registered redirect URI

    @Column()
      codeChallenge: string // The hashed PKCE code_challenge

    @Column()
      accessToken: string // The JWT token

    @CreateDateColumn()
      createdAt: Date

    @Column({ type: 'timestamp' })
      expiresAt: Date // Expiration time for the code
}
