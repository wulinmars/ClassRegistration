import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Role } from '@/types/type'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth/login')

    if (isAuthPage) {
      if (isAuth) {
        // Redirect authenticated users to their dashboard
        const role = token?.role as Role
        if (role === 'STUDENT') {
          return NextResponse.redirect(new URL('/student', req.url))
        } else if (role === 'TEACHER') {
          return NextResponse.redirect(new URL('/teacher', req.url))
        }
      }
      return null
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Role-based access control
    const role = token?.role as Role
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/teacher', req.url))
    }

    if (pathname.startsWith('/teacher') && role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/student', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth/login')
        const isApiRoute = req.nextUrl.pathname.startsWith('/api')
        
        if (isApiRoute) return true
        if (isAuthPage) return true
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/student/:path*', '/teacher/:path*', '/auth/login']
}
