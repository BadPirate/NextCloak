import { getServerSession, User } from "next-auth"
import { authOptions } from "./auth/[...nextauth]"
import { NextApiRequest, NextApiResponse } from "next"
import AppDataSource from "../../src/AppDataSource"
import { entities } from "@auth/typeorm-adapter"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const userId = session.user.id

  // Ensure the database connection is established
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  // ✅ Use NextAuth's User entity (not the type, the actual DB model)
  const UserEntity = AppDataSource.getRepository(entities.UserEntity)

  if (req.method === "PATCH") {
    const { name } = req.body

    if (!name || name.length < 3) {
      return res.status(400).json({ error: "Invalid name" })
    }

    try {
      await UserEntity.update({ id: userId }, { name })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error("Database Error:", error)
      return res.status(500).json({ error: "Database error" })
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" })
}