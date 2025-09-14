-- Initial schema aligned with current Prisma models and codebase

-- Enums
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'DROPPED');

-- Users table (maps to model User with @@map("users"))
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role "Role" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Courses table (maps to model Course with @@map("courses"))
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "teacherId" TEXT NOT NULL,
  "maxStudents" INTEGER NOT NULL DEFAULT 50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments table (maps to model Enrollment with @@map("enrollments"))
CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  status "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relations
ALTER TABLE courses
  ADD CONSTRAINT courses_teacher_fkey
  FOREIGN KEY ("teacherId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_student_fkey
  FOREIGN KEY ("studentId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_course_fkey
  FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes and constraints
CREATE UNIQUE INDEX enrollments_student_course_unique
  ON enrollments("studentId", "courseId");