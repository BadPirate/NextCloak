/* eslint-disable react/jsx-one-expression-per-line */
import { NextPage } from 'next'
import Head from 'next/head'
import { Container, Card } from 'react-bootstrap'

const TermsOfService: NextPage = () => (
  <>
    <Head>
      <title>Terms of Service - Badpirate Garage</title>
      <meta name="description" content="Terms of Service for Badpirate Garage Identity Provider" />
    </Head>
    <Container className="my-5">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4">Terms of Service</Card.Title>

          <Card.Text>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
            Badpirate Garage Identity Provider (&quot;Service&quot;).
          </Card.Text>
          <Card.Text>
            Please read these Terms carefully before using the Service.
          </Card.Text>

          <h5>1. Acceptance of Terms</h5>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms.
          </p>

          <h5>2. Use of the Service</h5>
          <ul>
            <li>You may use the Service only for authenticating with Badpirate Garage products.</li>
            <li>You shall not misuse the Service or interfere with its operation.</li>
          </ul>

          <h5>3. Changes to Terms</h5>
          <p>
            We may modify these Terms at any time. Notice of changes will be provided by posting
            the updated Terms on this page.
          </p>

          <h5>Contact Us</h5>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:garage@badpirate.net">garage@badpirate.net</a>.
          </p>
        </Card.Body>
      </Card>
    </Container>
  </>
)

export default TermsOfService
