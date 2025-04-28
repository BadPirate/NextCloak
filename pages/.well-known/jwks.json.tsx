import { GetServerSideProps } from 'next'
import forge from 'node-forge'
import rsaKeypair from '../../src/auth/rsaKeypair'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const publicKey = forge.pki.publicKeyFromPem(rsaKeypair.publicKey)
  const jwk = {
    kty: 'RSA',
    n: Buffer.from(publicKey.n.toByteArray()).toString('base64url'), // Modulus (n)
    e: Buffer.from(publicKey.e.toByteArray()).toString('base64url'), // Exponent (e)
    alg: 'RS256',
    use: 'sig',
    kid: 'rsa-key-1', // Key ID (change if rotating keys)
  }

  const jsonData = { keys: [jwk] }

  res.setHeader('Content-Type', 'application/json')
  res.write(JSON.stringify(jsonData))
  res.end()

  return { props: {} } // Empty props since we manually handle response
}

export default function JsonPage() {
  return null // Page renders nothing since response is handled in `getServerSideProps`
}
