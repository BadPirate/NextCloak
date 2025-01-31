import {
  Alert,
  Button,
  Table,
  Form,
  InputGroup,
} from "react-bootstrap"
import RootNav from "../src/components/RootNav"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function Home() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState(session?.user?.name || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session === undefined) {
      return
    }

    if (!session || !session.user) {
      signIn()
    } else if (process.env.HOME_URL) {
      router.push(process.env.HOME_URL)
    } else {
      setName(session.user.name || "")
    }
  }, [session])

  if (session === undefined) {
    return <Alert variant="info">Loading...</Alert>
  }

  const user = session?.user

  // Function to update user details
  const updateUser = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      // Update session with the new name
      await update({ user: { ...user, name } })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RootNav>
      <Table striped bordered>
        <tbody>
          {infoRow("Email", user?.email || "Unknown")}
          <tr>
            <th style={{ whiteSpace: "nowrap" }}>Name</th>
            <td>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="Not Set"
                />
                { !loading && name != user?.name ? (
                <Button onClick={updateUser} disabled={loading || name === user?.name}>
                  {loading ? "Saving..." : "Update"}
                </Button>
                ) : null }
              </InputGroup>
              {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
            </td>
          </tr>
        </tbody>
      </Table>
      <Button onClick={() => signOut()}>Sign out</Button>
    </RootNav>
  )

  function infoRow(key: string, value: string) {
    return (
      <tr>
        <th style={{ whiteSpace: "nowrap" }}>{key}</th>
        <td style={{ width: "100%" }}>{value}</td>
      </tr>
    )
  }
}

export default Home