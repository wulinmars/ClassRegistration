# 实现思路与架构设计

本项目基于Next.js App Router + Typescript + Prisma + PostgreSQL + NextAuth 构建，将实现”学生选课，老师查看与管理“的最小可行MVP

- 架构设计
  - 路由与页面：
    - /(auth)/login: 登录页
    - /student: 学生页面（课程列表、注册/退课）
    - /teacher: 老师页面（管理学生，筛选学生列表，比如订阅少于 3 门课程的学生）
  - 认证与授权
    - lib/auth.ts 配置 NextAuth 的 Credentials 登录并校验密码
    - 使用 JWT 回调将用户 id/role 注入 token；Session 回调将 id/role 注入session.user
    - middleware.ts 将基于橘色守卫路径：/student 仅 STUDENT访问, /teacher 仅 TEACHER 访问
  - 数据访问：
    - lib/db.ts 将提供 PrismaClient 访问单例
    - app/student/actions.ts 使用 Server Actions 执行业务写操作，并在服务端做 session/role 二次校验。
  - 安全设计：
    - /types 将强化 Session/User/JWT ，使用字面量联合类型 (STUDENT|TEACHER)
  - 数据表设计:
    - user表：主要字段 emai password role，保存用户信息与权限
    - course表：主要字段 tile，保持课程信息
    - enrollments 选课表，主要字段 student_id teacher_id course_id，user与course课程表多对多，映射学生，老师与课程的关系
