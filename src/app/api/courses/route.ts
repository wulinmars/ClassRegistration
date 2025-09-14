import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'


const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required'),
  description: z.string().optional(),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  maxStudents: z.number().int().min(1, 'Max students must be at least 1').default(50),
})


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    
    const courses = await prisma.course.findMany({
      where: teacherId ? { teacherId } : undefined,
      select: {
        id: true,
        title: true,
        description: true,
        maxStudents: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
        enrollments: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            enrolledAt: true,
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)


    const teacher = await prisma.user.findUnique({
      where: {
        id: validatedData.teacherId,
        role: 'TEACHER',
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found or invalid teacher ID' },
        { status: 400 }
      )
    }


    const newCourse = await prisma.course.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        teacherId: validatedData.teacherId,
        maxStudents: validatedData.maxStudents,
      },
      select: {
        id: true,
        title: true,
        description: true,
        maxStudents: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    return NextResponse.json({ course: newCourse }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}