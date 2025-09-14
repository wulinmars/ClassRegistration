# 学校选课系统 (Class Registration System)

一个基于现代技术栈构建的学校选课管理系统，支持学生选课和教师管理功能。

## 快速开始

- 前置要求
  - Node.js 18+
  - pnpm 或 npm
  - Docker (用于本地 PostgreSQL)

- 一键启动
  1. 复制环境配置
     - cp .env.example .env 或确保 .env 已包含以下字段：
       - DATABASE_URL=postgresql://postgres:password@localhost:5432/class_registration?schema=public
       - NEXTAUTH_SECRET=请替换为随机安全值
       - NEXTAUTH_URL=http://localhost:3000
  2. 启动数据库
     - docker compose up -d
  3. 安装依赖并启动应用
     - pnpm install
     - pnpm dev
  4. 打开浏览器
     - http://localhost:3000

- 首次启动会自动执行 Prisma 迁移并写入初始化数据（通过 migration 完成）。
- 演示账户
  - 学生: student@example.com / password123
  - 教师: teacher@example.com / password123

## 常用命令

- 数据库
  - 生成 Prisma Client: pnpm run db:generate
  - 推送 schema 到数据库（开发用）: pnpm run db:push
  - 应用迁移（生产/本地一致）: npx prisma migrate deploy
  - 打开 Prisma Studio: npx prisma studio

- 应用
  - 开发启动: pnpm dev
  - 生产构建: pnpm build
  - 生产启动: pnpm start

## 环境变量

- DATABASE_URL：PostgreSQL 连接串
- NEXTAUTH_SECRET：用于签名 JWT 的密钥
- NEXTAUTH_URL：应用外部访问地址

## Docker 数据库

- 本项目提供 docker-compose.yml，可一键启动 PostgreSQL 15
- 默认账号密码在 docker-compose.yml 中可见，务必仅用于本地开发

## 目录结构

```
/                    # 根目录
├─ prisma/           # Prisma schema 与 migrations
├─ scripts/          # 初始化脚本（首次启动自动执行迁移）
├─ src/              # 源码目录
│  ├─ app/           # Next.js App Router 页面与 API 路由
│  ├─ lib/           # 数据库、认证等工具
│  └─ types/         # 类型定义
└─ public/           # 静态资源
```

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
- **路由保护**: 中间件级别的访问控制
