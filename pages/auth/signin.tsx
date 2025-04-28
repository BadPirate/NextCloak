import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { Container, Row, Col, Button, Form, Card, Nav } from 'react-bootstrap'
import { getProviders, signIn, getCsrfToken, ClientSafeProvider } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'
import GoogleSignInButton from '../../src/components/GoogleSignInButton'

// Define expected provider structure more accurately
interface ExtendedClientSafeProvider extends ClientSafeProvider {
  credentials?: {
    username: { label?: string; placeholder?: string }
    password: { label?: string; placeholder?: string }
  }
}

// Define the expected shape of the providers prop from getServerSideProps
type ProvidersType = Record<string, ExtendedClientSafeProvider> | null

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return { redirect: { destination: '/' } }
  }

  const providers = await getProviders()
  const csrfToken = await getCsrfToken(context)

  return {
    props: {
      providers: (providers as ProvidersType) ?? {},
      csrfToken: csrfToken ?? '',
      callbackUrl: (context.query.callbackUrl as string) || '/',
    },
  }
}

const SignIn = ({
  providers,
  csrfToken,
  callbackUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const safeProviders = providers ?? {}
  const displayProviders = Object.values(safeProviders).filter(
    (provider: ExtendedClientSafeProvider): provider is ExtendedClientSafeProvider =>
      provider.id !== 'credentials',
  )
  const credentialsProvider = safeProviders.credentials
  const googleProvider = safeProviders.google
  const emailProviders = displayProviders.filter((provider) => provider.id !== 'google')

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6} lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="text-center mb-4">Sign In</Card.Title>

              {/* Google Provider Button with proper branding */}
              {googleProvider && (
                <div className="d-grid gap-2 mb-3">
                  <GoogleSignInButton callbackUrl={callbackUrl} />
                </div>
              )}

              {/* Other Provider Buttons */}
              {emailProviders.map((provider) => (
                <div key={provider.name} className="d-grid gap-2 mb-3">
                  <Button
                    variant="outline-primary"
                    onClick={() => signIn(provider.id, { callbackUrl })}
                  >
                    Sign in with {provider.name}
                  </Button>
                </div>
              ))}

              {/* Credentials Form (if enabled) */}
              {credentialsProvider && (
                <>
                  {displayProviders.length > 0 && <hr />}
                  <Form method="post" action="/api/auth/callback/credentials">
                    <input name="csrfToken" type="hidden" defaultValue={csrfToken ?? ''} />
                    <input name="callbackUrl" type="hidden" defaultValue={callbackUrl} />
                    <Form.Group className="mb-3" controlId="username">
                      <Form.Label>
                        {credentialsProvider.credentials?.username.label ?? 'Username'}
                      </Form.Label>
                      <Form.Control
                        name="username"
                        type="text"
                        placeholder={credentialsProvider.credentials?.username.placeholder ?? ''}
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
                        placeholder={credentialsProvider.credentials?.password.placeholder ?? ''}
                        required
                      />
                    </Form.Group>
                    <div className="d-grid">
                      <Button variant="primary" type="submit">
                        Sign in with {credentialsProvider.name}
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
