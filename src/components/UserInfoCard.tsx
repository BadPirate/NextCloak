import {
  Alert, Button, Form, InputGroup, Table,
} from 'react-bootstrap'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import RootNav from './RootNav'

function infoRow(key: string, value: string) {
  return (
    <tr>
      <th style={{ whiteSpace: 'nowrap' }}>{key}</th>
      <td style={{ width: '100%' }}>{value}</td>
    </tr>
  )
}

const UserInfo = ({
  user,
  hasPassword,
}: {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  },
  hasPassword: boolean
}) => {
  const { data: session, update } = useSession()

  const [loading, setLoading] = useState(false)

  // State for name update
  const [name, setName] = useState(session?.user?.name || '')
  const [error, setError] = useState<string | null>(null)

  // State for password update
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Function to update the user's name
  const updateUser = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      // Update session with the new name
      await update({ user: { ...user, name } })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Function to update the user's password
  const updatePassword = async () => {
    setLoading(true)
    setPasswordError(null)

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        throw new Error('Failed to update password')
      }

      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const buttonText = hasPassword ? 'Change Password' : 'Set Password'

  return (
    <RootNav>
      <Table striped bordered>
        <tbody>
          {infoRow('Email', user.email || 'Unknown')}
          <tr>
            <th style={{ whiteSpace: 'nowrap' }}>Name</th>
            <td>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="Not Set"
                />
                {!loading && name !== user.name ? (
                  <Button
                    onClick={updateUser}
                    disabled={loading || name === user?.name}
                  >
                    {loading ? 'Saving...' : 'Update'}
                  </Button>
                ) : null}
              </InputGroup>
              {error && (
                <Alert variant="danger" className="mt-2">
                  {error}
                </Alert>
              )}
            </td>
          </tr>

          {/* Password Update Section */}
          <tr>
            <th style={{ whiteSpace: 'nowrap' }}>Password</th>
            <td>
              <Form.Group className="mb-2">
                <Form.Control
                  type="password"
                  placeholder={hasPassword ? 'Change Password' : 'Set Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              <Button
                variant="primary"
                onClick={updatePassword}
                disabled={loading || password.length < 6 || confirmPassword.length < 6}
              >
                {loading ? 'Updating...' : buttonText}
              </Button>

              {passwordError && (
                <Alert variant="danger" className="mt-2">
                  {passwordError}
                </Alert>
              )}
            </td>
          </tr>
        </tbody>
      </Table>
      <Button onClick={() => signOut()}>Sign out</Button>
    </RootNav>
  )
}

export default UserInfo
