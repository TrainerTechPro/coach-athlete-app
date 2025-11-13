import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'COACH' | 'ATHLETE'
    } & DefaultSession['user']
  }

  interface User {
    role: 'COACH' | 'ATHLETE'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'COACH' | 'ATHLETE'
  }
}