import { NextPage } from 'next'
import { Alert, Container } from 'react-bootstrap'

interface ErrorProps {
  statusCode?: number
  message?: string
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode, message }) => (
  <Container className="mt-5">
    <Alert variant="danger">
      <Alert.Heading>
        {statusCode ? `Error ${statusCode}` : 'Client-side Error'}
      </Alert.Heading>
      <p>
        {message || 'An unexpected error occurred. Please try again later.'}
      </p>
    </Alert>
  </Container>
)

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  const message = err?.message || 'Page not found'

  return { statusCode, message }
}

export default ErrorPage
