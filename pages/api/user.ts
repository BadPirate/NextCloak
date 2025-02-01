import { hash } from "argon2"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth/[...nextauth]"
import { getAppDataSource } from "../../src/AppDataSource"
import { CredentialsEntity } from "../../src/entities/CredentialsEntity"
import { entities } from "@auth/typeorm-adapter"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const userId = session.user.id
  const AppDataSource = await getAppDataSource()

  // ✅ Get repositories
  const UserRepo = AppDataSource.getRepository(entities.UserEntity)
  const CredentialsRepo = AppDataSource.getRepository(CredentialsEntity)

  if (req.method === "PATCH") {
    const { name, password } = req.body

    try {
      // Update Name (if provided)
      if (name) {
        if (name.length < 3) {
          return res.status(400).json({ error: "Invalid name" })
        }
        await UserRepo.update({ id: userId }, { name })
        console.log("Updated name for user", userId)
      }

      // Update Password (if provided)
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters" })
        }

        // Hash the new password
        const hashedPassword = await hash(password)

        // Check if credentials exist for the user
        let credential = await CredentialsRepo.findOne({ where: { userId } })

        if (credential) {
          // Update existing credentials
          credential.hashedPassword = hashedPassword
          await CredentialsRepo.save(credential)
        } else {
          credential = CredentialsRepo.create({
            userId, 
            username: session.user.email || "",
            hashedPassword,
          })
          await CredentialsRepo.save(credential)
        }
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error("Database Error:", error)
      return res.status(500).json({ error: "Database error" })
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" })
}