# 学校选课系统 (Class Registration System)

一个基于现代技术栈构建的学校选课管理系统，支持学生选课和教师管理功能。

## 🚀 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **样式**: Tailwind CSS
- **包管理**: pnpm

## 📋 功能特性

### 学生功能
- 🔐 安全登录认证
- 📚 浏览所有可用课程
- ➕ 选择并订阅课程
- ➖ 退订已选课程

### 教师功能
- 🔐 安全登录认证
- 👥 查看所有学生列表
- 🔍 筛选学生（如：选课数量少于3门的学生）
- 📈 课程管理
- 📊 学生选课统计

## 🏗️ 系统架构

### 路由设计
```
/                    # 首页（重定向到登录）
/auth/login          # 登录页面
/student             # 学生仪表板
/teacher             # 教师仪表板
```

### 认证与授权
- **NextAuth.js** 配置基于凭据的登录
- **JWT Token** 包含用户ID和角色信息
- **Session** 管理用户状态
- **中间件保护** 基于角色的路由访问控制
  - `/student` 仅限学生访问
  - `/teacher` 仅限教师访问

### 数据模型
```prisma
User {
  id: String
  email: String
  password: String
  role: Role (STUDENT | TEACHER)
  name: String
  createdAt: DateTime
  updatedAt: DateTime
}

Course {
  id: String
  title: String
  description: String
  teacherId: String
  maxStudents: Int
  createdAt: DateTime
  updatedAt: DateTime
}

Enrollment {
  id: String
  studentId: String
  courseId: String
  enrolledAt: DateTime
  status: EnrollmentStatus (ACTIVE | DROPPED)
}
```

## 🔒 安全设计

- **类型安全**: 使用TypeScript字面量联合类型定义角色
- **服务端验证**: Server Actions中进行二次权限校验
- **密码加密**: 使用bcrypt进行密码哈希
- **会话管理**: 安全的JWT和Session处理
- **路由保护**: 中间件级别的访问控制、

## 📝 待办事项

- [ ] 实现课程容量限制
- [ ] 添加课程时间冲突检测
- [ ] 实现选课时间窗口控制
- [ ] 添加邮件通知功能
- [ ] 实现数据导出功能
- [ ] 添加课程评价系统
