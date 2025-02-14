import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm'

  @Entity('oauth_authorization_codes')
export default class OAuthAuthorizationCodeEntity {
    @PrimaryGeneratedColumn()
      id: number

    @Column({ unique: true })
      code: string

    @Column()
      redirectUri: string

    @Column()
      codeChallenge: string

    @Column()
      token: string

    @CreateDateColumn()
      createdAt: Date

    @Column({ type: 'timestamp' })
      expiresAt: Date
}
