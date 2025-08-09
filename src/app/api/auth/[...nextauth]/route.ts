import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

// We intentionally do NOT use `NextAuthOptions` here to avoid the TS namespace error.
// Your logic stays the same.
const handler = NextAuth({
  providers: [
    GoogleProvider({
      // keeping your env names as-is
      clientId: process.env.VITE_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // optional: custom login page
  },
  callbacks: {
    async session(
      { session, token }: { session: Session; token: JWT }
    ) {
      // Send properties to the client (customize as needed)
      return session;
    },
    async jwt(
      { token, user }: { token: any; user?: any }
    ) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
