import {
  Alert,
  Button,
  Table
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
    return (
      <Alert variant="info">Loading...</Alert>
    )
  }

  const user = session?.user

  return (
    <RootNav>
      <Table striped bordered>
        <tbody>
          {infoRow("Name", user?.name || "Unknown")}
          {infoRow("Email", user?.email || "Unknown")}
        </tbody>
      </Table>
      <Button onClick={() => signOut()}>Sign out</Button>
    </RootNav>
  )

  function infoRow(key: string, value: string) {
    return (
      <tr>
        <th style={{ whiteSpace: 'nowrap' }}>{key}</th>
        <td style={{ width: '100%' }}>{value}</td>
      </tr>
    )
  }
}

export default Home
