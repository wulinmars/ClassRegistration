import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema for updating enrollment status
const updateEnrollmentSchema = z.object({
  status: z.enum(['ACTIVE', 'DROPPED']),
})

// GET /api/enrollments/[id] - Get a specific enrollment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
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
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ enrollment })
  } catch (error) {
    console.error('Error fetching enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollment' },
      { status: 500 }
    )
  }
}

// PUT /api/enrollments/[id] - Update enrollment status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateEnrollmentSchema.parse(body)

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // If changing from DROPPED to ACTIVE, check course capacity
    if (existingEnrollment.status === 'DROPPED' && validatedData.status === 'ACTIVE') {
      const course = await prisma.course.findUnique({
        where: { id: existingEnrollment.courseId },
        select: {
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

      if (course && course._count.enrollments >= course.maxStudents) {
        return NextResponse.json(
          { error: 'Course is full' },
          { status: 400 }
        )
      }
    }

    // Update enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status: validatedData.status,
        ...(validatedData.status === 'ACTIVE' && { enrolledAt: new Date() }),
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

    return NextResponse.json({ enrollment: updatedEnrollment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}

// DELETE /api/enrollments/[id] - Delete an enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
      select: {
        id: true,
        student: {
          select: {
            name: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        message: `Enrollment of ${existingEnrollment.student.name} in ${existingEnrollment.course.title} deleted successfully`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    )
  }
}