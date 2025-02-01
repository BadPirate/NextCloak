import { Alert, Button } from "react-bootstrap"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import UserInfoCard from "../src/components/UserInfoCard"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]"
import { getAppDataSource } from "../src/AppDataSource"
import { CredentialsEntity } from "../src/entities/CredentialsEntity"

function Home({ hasPassword }: { hasPassword: boolean }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log("Session", session)
    if (status === "loading") return

    if (!session || !session.user) {
      signIn(undefined, { callbackUrl: "/" })
      return
    }

  }, [session, status])

  if (status === "loading") {
    return <Alert variant="info">Loading...</Alert>
  }

  if (!session || !session.user) {
    return <Button onClick={() => signIn(undefined, { callbackUrl: "/" })}>Sign In</Button>
  }

  return <UserInfoCard user={session.user} hasPassword={hasPassword} />
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session || !session.user) {
    console.log("No session found in SSR") // ✅ Debugging
    return { props: { hasPassword: null } }
  }

  const AppDataSource = await getAppDataSource()
  const CredentialsRepo = AppDataSource.getRepository(CredentialsEntity)

  const credential = await CredentialsRepo.findOne({ where: { userId: session.user.id } })
  const hasPassword = !!credential

  return {
    props: { hasPassword },
  }
}

export default Home