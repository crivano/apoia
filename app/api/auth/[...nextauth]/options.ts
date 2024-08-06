import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  // Configure one or more authentication providers
  providers: [
    // GithubProvider({
    //   clientId: process.env.CSVIEWER_GITHUB_ID,
    //   clientSecret: process.env.CSVIEWER_GITHUB_SECRET,
    // }),
    CredentialsProvider({
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
        // const { email, password } = credentials
        const system = credentials?.system
        const email = credentials?.email
        const password = credentials?.password
        const res = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL as string}api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system,
            email,
            password,
          }),
        });
        const user = await res.json();
        if (res.ok && user) {
          return user;
        } else return null;
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  }
}

export default authOptions
