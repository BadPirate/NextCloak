import {
  Button,
  Card, ListGroup,
} from 'react-bootstrap'
import RootNav from '../src/components/RootNav'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/router'
import { useEffect } from 'react'

function Home() {
  const { data: session } = useSession()


  const router = useRouter()

  useEffect(() => {
    if (session === undefined) {
      return
    }

    if (!session?.user) {
      signIn()
    } else if (process.env.HOME_URL) {
      router.push(process.env.HOME_URL)
    }
  }, [session])

  if (session === undefined) {
    return <div>Loading...</div>
  }

  return (
    <RootNav>
      <Card>
        <Card.Body>
          { session?.user ? <Button onClick={() => signOut()}>Sign out</Button> : <Button onClick={() => signIn()}>Sign in</Button> }
        </Card.Body>
      </Card>
    </RootNav>
  )
}

export default Home
