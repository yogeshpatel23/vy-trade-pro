import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./dbConnect";
import User, { IUser } from "@/models/User";
import { JWT } from "next-auth/jwt";
import { VySession } from "@/types";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Please Provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env or disable google auth"
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: VySession; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    // async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
    //   return token;
    // },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        const dbuser: IUser | null = await User.findOne({ email: user.email });
        if (dbuser) {
          user.id = dbuser._id.toString();
          return true;
        }
        const newUser: IUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          provider: account.provider,
          providerId: account.providerAccountId,
        });
        user.id = newUser._id.toString();
        return true;
      }
      return true;
    },
  },
};
