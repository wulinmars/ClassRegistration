const API_BASE_URL = '/api'


async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}


export const userApi = {

  getUsers: (role?: 'STUDENT' | 'TEACHER') => {
    const params = role ? `?role=${role}` : ''
    return apiRequest<{ users: any[] }>(`/users${params}`)
  },


  getUser: (id: string) => {
    return apiRequest<{ user: any }>(`/users/${id}`)
  },


  createStudent: (data: { name: string; email: string; password: string }) => {
    return apiRequest<{ user: any }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },


  deleteUser: (id: string) => {
    return apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}

// Course API functions
export const courseApi = {
  // Get all courses
  getCourses: (teacherId?: string) => {
    const params = teacherId ? `?teacherId=${teacherId}` : ''
    return apiRequest<{ courses: any[] }>(`/courses${params}`)
  },

  // Get course by ID
  getCourse: (id: string) => {
    return apiRequest<{ course: any }>(`/courses/${id}`)
  },

  // Create new course
  createCourse: (data: {
    title: string
    description?: string
    teacherId: string
    maxStudents?: number
  }) => {
    return apiRequest<{ course: any }>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update course
  updateCourse: (id: string, data: {
    title?: string
    description?: string
    maxStudents?: number
  }) => {
    return apiRequest<{ course: any }>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete course
  deleteCourse: (id: string) => {
    return apiRequest<{ message: string }>(`/courses/${id}`, {
      method: 'DELETE',
    })
  },
}

// Enrollment API functions
export const enrollmentApi = {
  // Get all enrollments
  getEnrollments: (params?: {
    studentId?: string
    courseId?: string
    status?: 'ACTIVE' | 'DROPPED'
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.studentId) searchParams.append('studentId', params.studentId)
    if (params?.courseId) searchParams.append('courseId', params.courseId)
    if (params?.status) searchParams.append('status', params.status)
    
    const queryString = searchParams.toString()
    return apiRequest<{ enrollments: any[] }>(`/enrollments${queryString ? `?${queryString}` : ''}`)
  },

  // Get enrollment by ID
  getEnrollment: (id: string) => {
    return apiRequest<{ enrollment: any }>(`/enrollments/${id}`)
  },

  // Create new enrollment (enroll student in course)
  createEnrollment: (data: { studentId: string; courseId: string }) => {
    return apiRequest<{ enrollment: any }>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update enrollment status
  updateEnrollment: (id: string, data: { status: 'ACTIVE' | 'DROPPED' }) => {
    return apiRequest<{ enrollment: any }>(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete enrollment
  deleteEnrollment: (id: string) => {
    return apiRequest<{ message: string }>(`/enrollments/${id}`, {
      method: 'DELETE',
    })
  },
}

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}