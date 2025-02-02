import {
  Entity, PrimaryColumn, Column, OneToOne, JoinColumn,
} from 'typeorm'
import { entities } from '@auth/typeorm-adapter'

const { UserEntity } = entities

@Entity({ name: 'credentials' })
class CredentialsEntity {
  // ✅ Explicitly mark `userId` as a primary column
  @PrimaryColumn('uuid')
    userId!: string

  @Column({ unique: true }) // ✅ Ensure username is unique
    username!: string

  @Column()
    hashedPassword!: string

  // ✅ Correct One-to-One relationship with `UserEntity`
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // ✅ Ensures `userId` is stored as a foreign key
    user!: any
}

export default CredentialsEntity
