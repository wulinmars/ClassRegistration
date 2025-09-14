'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Course, Enrollment } from '@/types/type'
import { courseApi, enrollmentApi, handleApiError } from '@/lib/api'



function CourseManagement({ studentId }: { studentId: string }) {
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled'>('available')
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [coursesResponse, enrollmentsResponse] = await Promise.all([
        courseApi.getCourses(),
        enrollmentApi.getEnrollments({ studentId, status: 'ACTIVE' })
      ])
      
      const allCourses = coursesResponse.courses
      const studentEnrollments = enrollmentsResponse.enrollments
      
      const enrolledCourseIds = new Set(studentEnrollments.map(e => e.course.id))
      const available = allCourses.filter(course => !enrolledCourseIds.has(course.id))
      const enrolled = studentEnrollments
      
      setAvailableCourses(available)
      setEnrolledCourses(enrolled)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [studentId])

  const handleEnrollCourse = async (courseId: string) => {
    try {
      await enrollmentApi.createEnrollment({ studentId, courseId })
      await loadData()
    } catch (err) {
      setError(handleApiError(err))
    }
  }

  const handleDropCourse = async (enrollmentId: string) => {
    try {
      await enrollmentApi.updateEnrollment(enrollmentId, { status: 'DROPPED' })
      await loadData()
    } catch (err) {
      setError(handleApiError(err))
    }
  }

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(e => e.courseId === courseId && e.status === 'ACTIVE')
  }

  return (
    <div className="bg-white shadow rounded-lg">

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


      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center py-8">
            <div className="text-lg">加载中...</div>
          </div>
        )}
        {!loading && activeTab === 'available' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">可选课程列表</h2>
            <div className="grid gap-4">
              {availableCourses.length > 0 ? (
                availableCourses.map((course) => (
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
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无可选课程</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'enrolled' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">已选课程列表</h2>
            <div className="grid gap-4">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                         <h3 className="text-lg font-medium text-gray-900">{enrollment.course?.title}</h3>
                         <p className="text-gray-600 mt-1">{enrollment.course?.description}</p>
                         <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                           <span>教师: {enrollment.course?.teacher.name}</span>
                           <span>容量: {enrollment.course?.maxStudents}</span>
                           <span>已选: {enrollment.course?._count?.enrollments || 0}</span>
                         </div>
                        <p className="text-sm text-green-600 mt-2">
                          选课时间: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDropCourse(enrollment.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        退课
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无已选课程</p>
                </div>
              )}
            </div>
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
    if (status === 'loading') return
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
        <div className="text-lg">加载中...</div>
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
                学生选课系统
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                欢迎，{session.user.name}！
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                退出登录
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
