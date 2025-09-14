CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, email, password, name, role)
VALUES ('seed-teacher-1', 'teacher@example.com', crypt('password123', gen_salt('bf', 10)), '测试教师', 'TEACHER'::"Role")
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password, name, role)
VALUES ('seed-student-1', 'student@example.com', crypt('password123', gen_salt('bf', 10)), '测试学生', 'STUDENT'::"Role")
ON CONFLICT (email) DO NOTHING;

INSERT INTO courses (id, title, description, "teacherId", "maxStudents")
SELECT 'course-1', '数学 101', '基础数学入门', u.id, 30 FROM users u WHERE u.email = 'teacher@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, title, description, "teacherId", "maxStudents")
SELECT 'course-2', '物理 101', '物理学入门', u.id, 25 FROM users u WHERE u.email = 'teacher@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, title, description, "teacherId", "maxStudents")
SELECT 'course-3', '化学 101', '化学入门', u.id, 20 FROM users u WHERE u.email = 'teacher@example.com'
ON CONFLICT (id) DO NOTHING;