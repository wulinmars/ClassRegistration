import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        name: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of teacher users (they should be managed differently)
    if (existingUser.role === 'TEACHER') {
      return NextResponse.json(
        { error: 'Cannot delete teacher users' },
        { status: 403 }
      )
    }

    // Delete the user (cascading deletes will handle enrollments)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: `User ${existingUser.name} deleted successfully` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            coursesAsTeacher: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            status: true,
            enrolledAt: true,
            course: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}