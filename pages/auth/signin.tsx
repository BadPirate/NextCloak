import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Script from 'next/script' // Import next/script
import { useEffect, useState } from 'react'
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Nav,
} from 'react-bootstrap'
import {
  getProviders,
  signIn,
  getCsrfToken,
  ClientSafeProvider,
} from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'

// Define expected provider structure more accurately
interface ExtendedClientSafeProvider extends ClientSafeProvider {
  credentials?: {
    username: { label?: string; placeholder?: string };
    password: { label?: string; placeholder?: string };
  };
}

// Define the expected shape of the providers prop from getServerSideProps
type ProvidersType = Record<string, ExtendedClientSafeProvider> | null;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return { redirect: { destination: '/' } }
  }

  const providers = await getProviders()
  const csrfToken = await getCsrfToken(context)
  // Get Google Client ID from environment variables
  const googleClientId = process.env.GOOGLE_CLIENT_ID

  return {
    props: {
      providers: providers as ProvidersType ?? {},
      csrfToken: csrfToken ?? '',
      googleClientId: googleClientId ?? null, // Pass client ID to props
    },
  }
}

const SignIn = ({
  providers,
  csrfToken,
  googleClientId, // Receive googleClientId
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  // Poll for Google Identity script loading
  useEffect(() => {
    let intervalId: number | undefined
    if (googleClientId) {
      intervalId = window.setInterval(() => {
        if (window.google?.accounts?.id) {
          setScriptLoaded(true)
          if (intervalId !== undefined) window.clearInterval(intervalId)
        }
      }, 50)
    }
    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [googleClientId])
  const safeProviders = providers ?? {}
  const displayProviders = Object.values(safeProviders).filter(
    (provider: ExtendedClientSafeProvider): provider is ExtendedClientSafeProvider => provider.id !== 'credentials',
  )
  const credentialsProvider = safeProviders.credentials

  // Construct the callback URL for Google Sign-In
  // Ensure NEXTAUTH_URL is set in your environment, fallback to the correct default port
  const callbackBaseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000' // Correct fallback port
  const googleLoginUri = `${callbackBaseUrl}/api/auth/callback/google`

  // Initialize and render Google button once scriptLoaded
  useEffect(() => {
    if (!scriptLoaded || !googleClientId) return
    window.google!.accounts.id.initialize({
      client_id: googleClientId,
      login_uri: googleLoginUri,
    })

    window.google!.accounts.id.renderButton(
      document.getElementById('googleSignInButton'), // Target the placeholder div
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'sign_in_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      },
    )
  }, [scriptLoaded, googleClientId, googleLoginUri])

  return (
    <Container className="mt-5">
      {/* Change script loading strategy to afterInteractive */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <Row className="justify-content-md-center">
        <Col md={6} lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="text-center mb-4">Sign In</Card.Title>

              {/* Provider Buttons/Elements */}
              {displayProviders.map((provider) => {
                if (provider.id === 'google') {
                  // Render Google provider with fallback logic
                  const key = provider.name
                  let content: React.ReactNode
                  if (!googleClientId) {
                    content = (
                      <p className="text-danger text-center small">
                        Google Client ID not configured.
                      </p>
                    )
                  } else if (!scriptLoaded) {
                    content = (
                      <Button
                        variant="outline-primary"
                        onClick={() => signIn(provider.id)}
                      >
                        Sign in with Google
                      </Button>
                    )
                  } else {
                    content = (
                      <div
                        id="googleSignInButton"
                        style={{ display: 'flex', justifyContent: 'center' }}
                      />
                    )
                  }
                  return (
                    <div key={key} className="d-grid gap-2 mb-3">
                      {content}
                    </div>
                  )
                }
                // Default button for other providers (e.g., Email)
                return (
                  <div key={provider.name} className="d-grid gap-2 mb-3">
                    <Button variant="outline-primary" onClick={() => signIn(provider.id)}>
                      Sign in with
                      {' '}
                      {provider.name}
                    </Button>
                  </div>
                )
              })}

              {/* Credentials Form (if enabled) */}
              {credentialsProvider && (
                <>
                  {(displayProviders.length > 0 || displayProviders.some((p) => p.id === 'google')) && <hr />}
                  {' '}
                  {/* Add separator if Google or other providers exist */}
                  <Form method="post" action="/api/auth/callback/credentials">
                    <input name="csrfToken" type="hidden" defaultValue={csrfToken ?? ''} />
                    <Form.Group className="mb-3" controlId="username">
                      <Form.Label>
                        {credentialsProvider.credentials?.username.label ?? 'Username'}
                      </Form.Label>
                      <Form.Control
                        name="username"
                        type="text"
                        placeholder={
                          credentialsProvider.credentials?.username.placeholder ?? ''
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>
                        {credentialsProvider.credentials?.password.label ?? 'Password'}
                      </Form.Label>
                      <Form.Control
                        name="password"
                        type="password"
                        placeholder={
                          credentialsProvider.credentials?.password.placeholder ?? ''
                        }
                        required
                      />
                    </Form.Group>
                    <div className="d-grid">
                      <Button variant="primary" type="submit">
                        Sign in with
                        {' '}
                        {credentialsProvider.name}
                      </Button>
                    </div>
                  </Form>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Footer */}
          <footer className="text-center text-muted">
            <Container>
              <Row>
                <Col>
                  <Nav className="justify-content-center">
                    <Nav.Item>
                      <Nav.Link href="/privacy" className="text-muted small">
                        Privacy Policy
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link href="/terms" className="text-muted small">
                        Terms of Service
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
              </Row>
            </Container>
          </footer>

        </Col>
      </Row>
    </Container>
  )
}

export default SignIn
