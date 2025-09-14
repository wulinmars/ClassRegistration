import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')
  
  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  console.log('Password hashed successfully')

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: hashedPassword,
      name: 'Test Student',
      role: 'STUDENT',
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      password: hashedPassword,
      name: 'Test Teacher',
      role: 'TEACHER',
    },
  })

  // Create some sample courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      title: 'Mathematics 101',
      description: 'Introduction to basic mathematics',
      teacherId: teacher.id,
      maxStudents: 30,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {},
    create: {
      id: 'course-2',
      title: 'Physics 101',
      description: 'Introduction to physics concepts',
      teacherId: teacher.id,
      maxStudents: 25,
    },
  })

  const course3 = await prisma.course.upsert({
    where: { id: 'course-3' },
    update: {},
    create: {
      id: 'course-3',
      title: 'Chemistry 101',
      description: 'Introduction to chemistry',
      teacherId: teacher.id,
      maxStudents: 20,
    },
  })

  console.log('Seed data created successfully!')
  console.log('Student:', student.email)
  console.log('Teacher:', teacher.email)
  console.log('Courses created:', [course1.title, course2.title, course3.title])
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
