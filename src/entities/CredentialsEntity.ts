import {
  Entity, PrimaryColumn, Column, OneToOne, JoinColumn,
} from 'typeorm'
import { entities } from '@auth/typeorm-adapter'

const { UserEntity } = entities

@Entity({ name: 'credentials' })
class CredentialsEntity {
  @PrimaryColumn('uuid')
    userId!: string

  @Column()
    hashedPassword!: string

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
    user!: any
}

export default CredentialsEntity
