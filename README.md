# NextCloak: Next.js Common Authentication Provider

This project is a Next.js based common authentication provider using `next-auth` and `TypeORM`.

Based on [NextStrap](https://github.com/BadPirate/nextstrap)

## Setup

### Production Environment

1. You can add / update any of the Providers that 
    [NextAuth supports](https://next-auth.js.org/v3/configuration/providers#oauth-providers), by default it's 
    configured to use email link.
   
2. Create a `.env` file in the root directory with the following environment variables:

    ```env
    EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
    EMAIL_FROM=no-reply@example.com
    AUTH_TYPEORM_CONNECTION=postgres://user:pass@postgreshost:5432/dbname
    NEXTAUTH_SECRET=your-secret-key
    ```

3. Build the project:

    ```sh
    npm run build
    ```

4. Start the production server:

    ```sh
    npm start
    ```

### Development Environment

1. Create a [.env.local](http://_vscodecontentref_/0) file in the root directory with the following environment variables:

    ```env
    EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
    EMAIL_FROM=no-reply@example.com
    AUTH_TYPEORM_CONNECTION=postgres://user:pass@localhost:5432/dbname
    NEXTAUTH_SECRET=your-secret-key
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Run the development server:

    ```sh
    npm run dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

