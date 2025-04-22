import React from 'react'
import { useRouter } from 'next/router'
import { Container, Card, Button } from 'react-bootstrap'

// Map NextAuth error codes to user-friendly titles and descriptions
const errorMessages: Record<string, { title: string; description: string }> = {
  OAuthSignin: {
    title: 'Authorization Error',
    description: 'There was a problem authorizing with the provider. Please try again.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'The provider returned an error during callback. Please try again or contact support.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    description: 'Unable to create an account using the OAuth provider. Please contact support.',
  },
  EmailCreateAccount: {
    title: 'Email Account Creation Failed',
    description: 'There was a problem creating an account with your email. Please try again later.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'There was a problem during sign in callback. Please try again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another sign in method. Please use the same provider you originally used.',
  },
  EmailSignin: {
    title: 'Email Sign In Failed',
    description: 'Failed to sign in with email. Please check your link or try again.',
  },
  CredentialsSignin: {
    title: 'Sign In Failed',
    description: 'Invalid username or password. Please try again.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You must be signed in to access this page.',
  },
  Default: {
    title: 'Unexpected Error',
    description: 'An unexpected error occurred. Please try again later.',
  },
}

const ErrorPage: React.FC = () => {
  const router = useRouter()
  const { error } = router.query
  // Determine the error code (string) or fall back to Default
  const errorKey = typeof error === 'string' && error in errorMessages ? error : 'Default'
  const { title, description } = errorMessages[errorKey]

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body className="text-center">
          <Card.Title>{title}</Card.Title>
          <Card.Text className="mb-4">{description}</Card.Text>
          <Button variant="primary" href="/api/auth/signin">
            Return to Sign In
          </Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ErrorPage
