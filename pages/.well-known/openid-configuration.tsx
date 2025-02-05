import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const jsonData = {
    "issuer": process.env.NEXTAUTH_URL,
    "authorization_endpoint": `${process.env.NEXTAUTH_URL}/api/oauth/authorize`,
    "token_endpoint": `${process.env.NEXTAUTH_URL}/api/oauth/token`,
    "userinfo_endpoint": `${process.env.NEXTAUTH_URL}/api/oauth/userinfo`,
    "jwks_uri": `${process.env.NEXTAUTH_URL}/.well-known/jwks.json`,
    "registration_endpoint": `${process.env.NEXTAUTH_URL}/register`, // TODO: Add registration endpoint
    
    "response_types_supported": ["code", "token", "id_token"],
    "subject_types_supported": ["public"],
    "id_token_signing_alg_values_supported": ["RS256"],
    
    "scopes_supported": ["openid", "profile", "email"],
    "claims_supported": ["sub", "name", "email", "picture"],
  
    "grant_types_supported": ["authorization_code", "refresh_token", "client_credentials"],
    
    "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post", "none"],
  
    "code_challenge_methods_supported": ["S256"]
  };

  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(jsonData));
  res.end();

  return { props: {} }; // Empty props since we manually handle response
};

export default function JsonPage() {
  return null; // Page renders nothing since response is handled in `getServerSideProps`
}