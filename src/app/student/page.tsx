'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Course, Enrollment } from '@/types/type'

// 模拟数据 - 可选课程
const mockAvailableCourses: Course[] = [
  {
    id: '1',
    title: '高等数学',
    description: '微积分、线性代数等数学基础课程',
    teacherId: 'teacher1',
    maxStudents: 50,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    teacher: {
      id: 'teacher1',
      name: '张教授',
      email: 'zhang@example.com'
    },
    _count: {
      enrollments: 25
    }
  },
  {
    id: '2',
    title: '计算机程序设计',
    description: 'Python编程基础与实践',
    teacherId: 'teacher2',
    maxStudents: 40,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    teacher: {
      id: 'teacher2',
      name: '李老师',
      email: 'li@example.com'
    },
    _count: {
      enrollments: 30
    }
  },
  {
    id: '3',
    title: '数据结构与算法',
    description: '计算机科学核心课程，学习各种数据结构和算法',
    teacherId: 'teacher3',
    maxStudents: 35,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    teacher: {
      id: 'teacher3',
      name: '王教授',
      email: 'wang@example.com'
    },
    _count: {
      enrollments: 20
    }
  }
]

// 模拟数据 - 已选课程
const mockEnrolledCourses: Enrollment[] = [
  {
    id: 'enrollment1',
    studentId: 'student1',
    courseId: '1',
    status: 'ACTIVE',
    enrolledAt: new Date('2024-01-15'),
    course: mockAvailableCourses[0]
  }
]

function CourseManagement({ studentId }: { studentId: string }) {
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled'>('available')
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>(mockEnrolledCourses)

  const handleEnrollCourse = (courseId: string) => {
    const course = mockAvailableCourses.find(c => c.id === courseId)
    if (course) {
      const newEnrollment: Enrollment = {
        id: `enrollment_${Date.now()}`,
        studentId,
        courseId,
        status: 'ACTIVE',
        enrolledAt: new Date(),
        course
      }
      setEnrolledCourses(prev => [...prev, newEnrollment])
    }
  }

  const handleDropCourse = (enrollmentId: string) => {
    setEnrolledCourses(prev => prev.filter(e => e.id !== enrollmentId))
  }

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(e => e.courseId === courseId && e.status === 'ACTIVE')
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            可选课程
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'enrolled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            已选课程 ({enrolledCourses.length})
          </button>
        </nav>
      </div>

      {/* 课程内容 */}
      <div className="p-6">
        {activeTab === 'available' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">可选课程列表</h2>
            <div className="grid gap-4">
              {mockAvailableCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <p className="text-gray-600 mt-1">{course.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>授课教师: {course.teacher.name}</span>
                        <span>已选人数: {course._count?.enrollments || 0}/{course.maxStudents}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isEnrolled(course.id) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          已选课
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={(course._count?.enrollments || 0) >= course.maxStudents}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                             (course._count?.enrollments || 0) >= course.maxStudents
                               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                               : 'bg-blue-600 text-white hover:bg-blue-700'
                           }`}
                        >
                          {(course._count?.enrollments || 0) >= course.maxStudents ? '已满' : '选课'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'enrolled' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">已选课程列表</h2>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">您还没有选择任何课程</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {enrolledCourses.map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{enrollment.course?.title}</h3>
                        <p className="text-gray-600 mt-1">{enrollment.course?.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>授课教师: {enrollment.course?.teacher.name}</span>
                          <span>选课时间: {enrollment.enrolledAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleDropCourse(enrollment.id)}
                          className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          退课
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (session.user.role !== 'STUDENT') {
      router.push('/teacher')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Student Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {session.user.name}!
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <CourseManagement studentId={session.user.id} />
        </div>
      </main>
    </div>
  )
}
