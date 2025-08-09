import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      // keep your env names; we can rename later if you want
      clientId: process.env.VITE_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session(
      { session, token }: { session: Session; token: JWT }
    ) {
      // Send properties to the client (customize later if needed)
      return session;
    },
    async jwt(
      { token, user }: { token: any; user?: any }
    ) {
      // Preserve your logic; cast to any to avoid JWT type augmentation for now
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
