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
  createdAt: string
  updatedAt: string
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
  enrolledAt: string
  student?: {
    id: string
    name: string
    email: string
  }
  course?: Course
}

export interface Student {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
  enrollments?: Enrollment[]
  _count?: {
    enrollments: number
  }
}

export interface Teacher {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
  coursesAsTeacher?: Course[]
  _count?: {
    coursesAsTeacher: number
  }
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
