import { Alert, Button } from 'react-bootstrap'
import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import UserInfoCard from '../src/components/UserInfoCard'
import { authOptions } from './api/auth/[...nextauth]'
import { getAppDataSource } from '../src/AppDataSource'
import CredentialsEntity from '../src/entities/CredentialsEntity'
import logger from '../src/logger'

const Home = ({ hasPassword }: { hasPassword: boolean }) => {
  const { data: session, status } = useSession()

  useEffect(() => {
    logger.info('Session', session)
    if (status === 'loading') return

    if (!session || !session.user) {
      signIn()
    }
  }, [session, status])

  if (status === 'loading') {
    return <Alert variant="info">Loading...</Alert>
  }

  if (!session || !session.user) {
    return <Button onClick={() => signIn()}>Sign In</Button>
  }

  return <UserInfoCard user={session.user} hasPassword={hasPassword} />
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session || !session.user) {
    logger.info('No session found in SSR')
    return { props: { hasPassword: null } }
  }

  const AppDataSource = await getAppDataSource()
  const CredentialsRepo = AppDataSource.getRepository(CredentialsEntity)

  const credential = await CredentialsRepo.findOne({
    where: { user: { email: session.user.email } },
  })
  const hasPassword = !!credential

  return {
    props: { hasPassword },
  }
}

export default Home
