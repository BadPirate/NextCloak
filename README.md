# Badpirate Garage Auth

Badpirate Garage Auth is an OpenID Connect (OIDC)–compatible authentication provider built with Next.js, NextAuth, TypeORM, and Prisma. It enables you to quickly spin up a centralized identity service for any Badpirate Garage product.

## Features

- **OIDC endpoints**:
  - `GET /api/oauth/authorize`
  - `POST /api/oauth/token`
  - `GET /api/oauth/userinfo`
- **Multiple Authentication Providers**:
  - Custom Credentials provider with Argon2 for secure password storage
  - Email link sign-in via `next-auth/providers/email`
  - Google OAuth sign-in
  - Flexible extension: add your own NextAuth providers (GitHub, Apple, etc.)
- **Database Options**:
  - TypeORM adapter (PostgreSQL by default) with extra entities for OAuth codes and credentials
  - Prisma ORM support for both SQLite and PostgreSQL
- **Development Tooling**:
  - Playwright for end-to-end testing with debugging and headless options
  - Jest for unit testing with mocking and testing-library support
  - ESLint and Prettier for code style enforcement
  - Husky for Git hooks and lint-staged for pre-commit checks
  - TypeScript in strict mode for type safety

## Getting Started

**Note**: This project uses the Yarn package manager, not npm.

1. **Fork** this repository and clone your fork:
   ```sh
   git clone https://github.com/your-org/badpirate-auth.git
   cd badpirate-auth
   ```
2. **Install** dependencies:
   ```sh
   yarn install
   ```
3. **Configure** environment variables:
   Create a `.env.local` file in the project root (see `.env.local.EXAMPLE` for details):

   ```env
   # Database (PostgreSQL)
   AUTH_TYPEORM_CONNECTION=postgres://user:pass@localhost:5432/dbname
   DATABASE_URL=postgres://user:pass@localhost:5432/dbname

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

4. **Run** the development server:
   ```sh
   yarn dev
   ```
5. **Build** and **start** for production:
   ```sh
   yarn build
   yarn start
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

## Testing

This project includes end-to-end tests powered by Playwright Test and unit tests with Jest.

- **End-to-End Tests**:

  ```sh
  # Install browser binaries
  npx playwright install

  # Run tests
  yarn test:e2e
  ```

- **Unit Tests**:
  ```sh
  yarn test
  ```
- **Linting and Type Checking**:
  ```sh
  yarn lint
  ```

## Prisma Configuration

This project supports both TypeORM (default) and Prisma ORM for database management.

1. Generate Prisma client:

   ```sh
   npx prisma generate
   ```

2. Push the schema to the database:

   ```sh
   npx prisma db push
   ```

3. For testing, set up the test database:
   ```sh
   node scripts/setup-test-db.js
   ```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## Privacy Policy & Terms of Service

- **Privacy Policy**: [/privacy](/privacy)
- **Terms of Service**: [/terms](/terms)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
