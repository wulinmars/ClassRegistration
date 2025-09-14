import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Demo users for testing (in production, use database)
const demoUsers = [
  {
    id: '1',
    email: 'student@example.com',
    password: 'password123',
    name: 'Test Student',
    role: 'STUDENT' as const
  },
  {
    id: '2',
    email: 'teacher@example.com',
    password: 'password123',
    name: 'Test Teacher',
    role: 'TEACHER' as const
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = demoUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login'
  }
}
