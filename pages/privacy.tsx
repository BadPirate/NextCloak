import { NextPage } from 'next'
import Head from 'next/head'
import { Container, Card } from 'react-bootstrap'

const PrivacyPolicy: NextPage = () => (
  <>
    <Head>
      <title>Privacy Policy - Badpirate Garage</title>
      <meta name="description" content="Privacy Policy for Badpirate Garage Identity Provider" />
    </Head>
    <Container className="my-5">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4">Privacy Policy</Card.Title>
          <Card.Text>
            This Privacy Policy describes how Badpirate Garage
            (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares
            information in connection with the Badpirate Garage Identity Provider
            (&quot;Service&quot;).
          </Card.Text>
          <Card.Text>
            Your privacy is important to us.
          </Card.Text>

          <h5>Information We Collect</h5>
          <ul>
            <li>User registration data (e.g., email, name).</li>
            <li>Authentication credentials and session information.</li>
            <li>Usage data and logs for debugging and auditing.</li>
          </ul>

          <h5>How We Use Information</h5>
          <ul>
            <li>To authenticate and authorize users.</li>
            <li>To provide and maintain the Service.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h5>Contact Us</h5>
          <p>
            If you have any questions about this Privacy Policy, please contact us at
            <a href="mailto:garage@badpirate.net">
              garage@badpirate.net
            </a>
            .
          </p>
        </Card.Body>
      </Card>
    </Container>
  </>
)

export default PrivacyPolicy
