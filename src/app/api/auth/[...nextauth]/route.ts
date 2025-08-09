import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Build-safe version: no NextAuthOptions/Session/JWT types.
// Uses explicit `any` to satisfy strict TS in Vercel.

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.VITE_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user?.id) token.id = user.id;
      return token;
    },
  },
});

export { handler as GET, handler as POST };
