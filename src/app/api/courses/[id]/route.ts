import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'


const updateCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').optional(),
  description: z.string().optional(),
  maxStudents: z.number().int().min(1, 'Max students must be at least 1').optional(),
})


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const course = await prisma.course.findUnique({
      where: { id },
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
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
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

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if there are active enrollments
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments. Please remove all students first.' },
        { status: 400 }
      )
    }

    // Delete the course (cascading deletes will handle enrollments)
    await prisma.course.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: `Course "${existingCourse.title}" deleted successfully` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}