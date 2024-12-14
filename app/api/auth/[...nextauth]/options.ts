import CredentialsProvider from "next-auth/providers/credentials";
import KeycloakProvider from "next-auth/providers/keycloak";
// import jwt from 'jsonwebtoken'
import * as jose from "jose";

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  // Configure one or more authentication providers
  providers: [] as any[],
  callbacks: {
    async jwt({ token, user, account }) {
      let roles = undefined as
        | { [key: string]: { roles: Array<any> } }
        | undefined;

      if (account?.access_token) {
        let decodedToken = jose.decodeJwt(account?.access_token);
        if (decodedToken && typeof decodedToken !== "string") {
          roles = (decodedToken?.realm_access as any)?.roles;
        }
      }
      token = { roles, accessToken: account?.access_token, ...token, ...user };
      // console.log("[jwt callback] token " + JSON.stringify(token));
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

// GithubProvider({
//   clientId: process.env.CSVIEWER_GITHUB_ID,
//   clientSecret: process.env.CSVIEWER_GITHUB_SECRET,
// }),
if (process.env.SYSTEMS) {
  authOptions.providers.push(CredentialsProvider({
    // The name to display on the sign in form (e.g. "Sign in with...")
    name: "Credentials",
    // `credentials` is used to generate a form on the sign in page.
    // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      system: {
        label: "System",
        type: "text",
        placeholder: "Enter System",
      },
      email: {
        label: "Email",
        type: "text",
        placeholder: "Enter email",
      },
      password: {
        label: "Password",
        type: "password",
        placeholder: "Enter Password",
      },
    },

    async authorize(credentials, req) {
      const system = credentials?.system;
      let email = credentials?.email;
      let password = credentials?.password;

      if (process.env.NEXTAUTH_REPLACE_EMAIL_AND_PASSWORD) {
        const a = Buffer.from(process.env.NEXTAUTH_REPLACE_EMAIL_AND_PASSWORD, 'base64').toString('utf-8').split(",")
        if (a[0] === email && a[1] === password) {
          email = a[2]
          password = a[3]
        }
      }

      const res = await fetch(
        `${process.env.NEXTAUTH_URL_INTERNAL as string}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system,
            email,
            password,
          }),
        },
      );
      const user = await res.json();
      if (res.ok && user) {
        return user;
      } else return null;
    },
  }));
}

if (process.env.KEYCLOAK_ID) {
  authOptions.providers.push(KeycloakProvider({
    clientId: process.env.KEYCLOAK_ID as string,
    clientSecret: process.env.KEYCLOAK_SECRET as string,
    issuer: process.env.KEYCLOAK_ISSUER,
  }));
}

export default authOptions;
