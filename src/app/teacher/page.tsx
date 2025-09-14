'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Course, Student, Enrollment } from '@/types/type'

// 模拟数据 - 课程列表
const mockCourses: Course[] = [
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
    teacherId: 'teacher1',
    maxStudents: 40,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    teacher: {
      id: 'teacher1',
      name: '张教授',
      email: 'zhang@example.com'
    },
    _count: {
      enrollments: 30
    }
  }
]

// 模拟数据 - 学生列表
const mockStudents: Student[] = [
  {
    id: 'student1',
    name: '李小明',
    email: 'lixiaoming@example.com',
    role: 'STUDENT',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: {
      enrollments: 2
    }
  },
  {
    id: 'student2',
    name: '王小红',
    email: 'wangxiaohong@example.com',
    role: 'STUDENT',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: {
      enrollments: 1
    }
  },
  {
    id: 'student3',
    name: '张小华',
    email: 'zhangxiaohua@example.com',
    role: 'STUDENT',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: {
      enrollments: 4
    }
  },
  {
    id: 'student4',
    name: '刘小强',
    email: 'liuxiaoqiang@example.com',
    role: 'STUDENT',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: {
      enrollments: 0
    }
  }
]

function TeacherManagement({ teacherId }: { teacherId: string }) {
  const [activeTab, setActiveTab] = useState<'courses' | 'students'>('courses')
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents)
  const [searchQuery, setSearchQuery] = useState('')
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | 'less_than_3' | 'no_courses'>('all')
  
  // 课程管理相关状态
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', description: '', maxStudents: 50 })
  
  // 学生管理相关状态
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: '', email: '' })

  // 课程管理函数
  const handleAddCourse = () => {
    if (newCourse.title.trim()) {
      const course: Course = {
        id: `course_${Date.now()}`,
        title: newCourse.title,
        description: newCourse.description,
        teacherId,
        maxStudents: newCourse.maxStudents,
        createdAt: new Date(),
        updatedAt: new Date(),
        teacher: {
          id: teacherId,
          name: '当前教师',
          email: 'teacher@example.com'
        },
        _count: {
          enrollments: 0
        }
      }
      setCourses(prev => [...prev, course])
      setNewCourse({ title: '', description: '', maxStudents: 50 })
      setShowAddCourse(false)
    }
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId))
  }

  // 学生管理函数
  const handleAddStudent = () => {
    if (newStudent.name.trim() && newStudent.email.trim()) {
      const student: Student = {
        id: `student_${Date.now()}`,
        name: newStudent.name,
        email: newStudent.email,
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          enrollments: 0
        }
      }
      setStudents(prev => [...prev, student])
      setNewStudent({ name: '', email: '' })
      setShowAddStudent(false)
    }
  }

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId))
  }

  // 学生筛选和搜索
  useEffect(() => {
    let filtered = students
    
    // 按姓名或邮箱搜索
    if (searchQuery.trim()) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // 按选课数量筛选
    if (enrollmentFilter === 'less_than_3') {
      filtered = filtered.filter(student => (student._count?.enrollments || 0) < 3)
    } else if (enrollmentFilter === 'no_courses') {
      filtered = filtered.filter(student => (student._count?.enrollments || 0) === 0)
    }
    
    setFilteredStudents(filtered)
  }, [students, searchQuery, enrollmentFilter])

  return (
    <div className="bg-white shadow rounded-lg">
      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            课程管理 ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            学生管理 ({students.length})
          </button>
        </nav>
      </div>

      {/* 课程管理内容 */}
      {activeTab === 'courses' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">课程列表</h2>
            <button
              onClick={() => setShowAddCourse(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              添加课程
            </button>
          </div>

          {/* 添加课程表单 */}
          {showAddCourse && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-md font-medium text-gray-900 mb-4">添加新课程</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">课程名称</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入课程名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最大学生数</label>
                  <input
                    type="number"
                    value={newCourse.maxStudents}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 50 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">课程描述</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请输入课程描述"
                />
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleAddCourse}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  确认添加
                </button>
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 课程列表 */}
          <div className="grid gap-4">
            {courses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                    <p className="text-gray-600 mt-1">{course.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>已选人数: {course._count?.enrollments || 0}/{course.maxStudents}</span>
                      <span>创建时间: {course.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      删除课程
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无课程，点击上方按钮添加课程</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 学生管理内容 */}
      {activeTab === 'students' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">学生列表</h2>
            <button
              onClick={() => setShowAddStudent(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              添加学生
            </button>
          </div>

          {/* 搜索和筛选 */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">搜索学生</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="按姓名或邮箱搜索"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选课数量筛选</label>
              <select
                value={enrollmentFilter}
                onChange={(e) => setEnrollmentFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部学生</option>
                <option value="less_than_3">选课少于3门</option>
                <option value="no_courses">未选课</option>
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-600">共找到 {filteredStudents.length} 名学生</span>
            </div>
          </div>

          {/* 添加学生表单 */}
          {showAddStudent && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-md font-medium text-gray-900 mb-4">添加新学生</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学生姓名</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入学生姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入邮箱地址"
                  />
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleAddStudent}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  确认添加
                </button>
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 学生列表 */}
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                    <p className="text-gray-600 mt-1">{student.email}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>已选课程: {student._count?.enrollments || 0} 门</span>
                      <span>注册时间: {student.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      删除学生
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery || enrollmentFilter !== 'all' ? '没有找到符合条件的学生' : '暂无学生，点击上方按钮添加学生'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TeacherPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (session.user.role !== 'TEACHER') {
      router.push('/student')
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
                Teacher Dashboard
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
          <TeacherManagement teacherId={session.user.id} />
        </div>
      </main>
    </div>
  )
}
