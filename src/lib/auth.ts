import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Always include Google provider with fallback values for build
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'temp-google-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'temp-google-secret',
    }),
    // Always include GitHub provider with fallback values for build
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || 'temp-github-id', 
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'temp-github-secret',
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
})
