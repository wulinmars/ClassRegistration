import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

export type Role = 'STUDENT' | 'TEACHER'
export type EnrollmentStatus = 'ACTIVE' | 'DROPPED'

export interface Course {
  id: string
  title: string
  description?: string
  teacherId: string
  maxStudents: number
  createdAt: Date
  updatedAt: Date
  teacher: {
    id: string
    name: string
    email: string
  }
  enrollments?: Enrollment[]
  _count?: {
    enrollments: number
  }
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  status: EnrollmentStatus
  enrolledAt: Date
  student?: {
    id: string
    name: string
    email: string
  }
  course?: Course
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: Role
  }
}
