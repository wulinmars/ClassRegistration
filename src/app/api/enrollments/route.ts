import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'


const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
})


const updateEnrollmentSchema = z.object({
  status: z.enum(['ACTIVE', 'DROPPED']),
})


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    
    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(courseId && { courseId }),
        ...(status && { status: status as 'ACTIVE' | 'DROPPED' }),
      },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            maxStudents: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    })

    return NextResponse.json({ enrollments })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST /api/enrollments - Create a new enrollment (student enrolls in course)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createEnrollmentSchema.parse(body)

    // Check if student exists and is a student
    const student = await prisma.user.findUnique({
      where: {
        id: validatedData.studentId,
        role: 'STUDENT',
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or invalid student ID' },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
      select: {
        id: true,
        title: true,
        maxStudents: true,
        _count: {
          select: {
            enrollments: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 400 }
      )
    }

    // Check if course is full
    if (course._count.enrollments >= course.maxStudents) {
      return NextResponse.json(
        { error: 'Course is full' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: validatedData.studentId,
          courseId: validatedData.courseId,
        },
      },
    })

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'Student is already enrolled in this course' },
          { status: 400 }
        )
      } else {
        // Re-activate dropped enrollment
        const updatedEnrollment = await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: 'ACTIVE',
            enrolledAt: new Date(),
          },
          select: {
            id: true,
            status: true,
            enrolledAt: true,
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        })

        return NextResponse.json({ enrollment: updatedEnrollment }, { status: 200 })
      }
    }

    // Create new enrollment
    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentId: validatedData.studentId,
        courseId: validatedData.courseId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    })

    return NextResponse.json({ enrollment: newEnrollment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}