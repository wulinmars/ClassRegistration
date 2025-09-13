import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import z, { email } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authOptions: NextAuthOptions = {
  session: {strategy: 'jwt'},
  pages: {signIn: '/login'},
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {label: 'Email', type: 'email'},
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email } = parsed.data;

        return {
          id: '',
          email,
          name: '',
        };
      }
    })
  ]
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};