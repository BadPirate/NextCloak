# Badpirate Garage OIDC Provider

Badpirate Garage OIDC Provider is an OpenID Connect (OIDC)–compatible authentication provider template built with Next.js, NextAuth, and TypeORM. It enables you to quickly spin up a centralized identity service for any Badpirate Garage product, featuring:

- OIDC Authorization Code flow with PKCE (`/api/oauth/authorize`, `/api/oauth/token`, `/api/oauth/userinfo`).
- Secure credential‑based authentication provider (Argon2 password hashing via a custom NextAuth `Credentials` provider).
- Email link sign‑in (`next-auth/providers/email`).
- Flexible extension: add your own NextAuth providers (Google, GitHub, Apple, etc.).

## Features

- **Forkable template** to build your own centralized authentication microservice.
- **OIDC endpoints**:
  - `GET /api/oauth/authorize`
  - `POST /api/oauth/token`
  - `GET /api/oauth/userinfo`
- **Custom Credentials provider** uses Argon2 for secure password storage.
- **TypeORM adapter** (PostgreSQL by default) with extra entities for OAuth codes and credentials.

## Getting Started

1. **Fork** this repository and clone your fork:
   ```sh
   git clone https://github.com/your-org/nextcloak.git
   cd nextcloak
   ```
2. **Install** dependencies:
   ```sh
   npm install
   ```
3. **Configure** environment variables:
   Create a `.env.local` file in the project root:
   ```env
   # Database (PostgreSQL)
   AUTH_TYPEORM_CONNECTION=postgres://user:pass@localhost:5432/dbname

   # NextAuth secret (used for JWT and sessions)
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000

   # Email sign‑in (SMTP URL and sender)
   EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
   EMAIL_FROM=no-reply@example.com

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # RSA keys for ID tokens (base64‑encoded PEM)
   RSA_PRIVATE_KEY=<base64PrivateKey>
   RSA_PUBLIC_KEY=<base64PublicKey>

   # Optional: restrict valid redirect_uris for OAuth flows
   REDIRECT_REGEX=^https://your-app\.example\.com.*
   ```
4. **Customize** providers:
   Edit `pages/api/auth/[...nextauth].ts` and modify the `providers` array:
   ```ts
   import Google from 'next-auth/providers/google'
   import Email from 'next-auth/providers/email'
   import Credentials from 'next-auth/providers/credentials'

   export const authOptions = {
     providers: [
       // 1st: OAuth (Google) provider
       Google({ clientId: '...', clientSecret: '...' }),
       // 2nd: Email sign-in
       Email({ server: process.env.EMAIL_SERVER, from: process.env.EMAIL_FROM }),
       // 3rd: Credentials
       Credentials({ name: 'Credentials', credentials: { /* ... */ }, authorize: /* ... */ }),
       // Add any additional providers here
     ],
     // ...
   }
   ```
5. **Run** the development server:
   ```sh
   npm run dev
   ```
6. **Build** and **start** for production:
   ```sh
   npm run build
   npm start
   ```

## Usage

- Sign in at `/api/auth/signin` (choose email or credentials).
- Obtain an authorization code:
  ```
  GET /api/oauth/authorize?
    client_id=your-client-id
    &redirect_uri=your-redirect-uri
    &response_type=code
    &scope=openid%20email%20profile
    &code_challenge=...
    &code_challenge_method=S256
  ```
- Exchange the code for an ID token:
  ```
  POST /api/oauth/token
  Content-Type: application/x-www-form-urlencoded
  Authorization: Basic <base64(client_id:client_secret)>
  grant_type=authorization_code
  code=...
  redirect_uri=...
  code_verifier=...
  ```
- Retrieve user info:
  ```
  GET /api/oauth/userinfo
  Authorization: Bearer <id_token>
  ```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## Privacy Policy & Terms of Service

- **Privacy Policy**: [https://<your-domain>/privacy](https://<your-domain>/privacy)
- **Terms of Service**: [https://<your-domain>/terms](https://<your-domain>/terms)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

