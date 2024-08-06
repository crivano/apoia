import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials";
import authOptions from './options'


// export default NextAuth(authOptions);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };