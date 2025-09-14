const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const prisma = new PrismaClient()
const MIGRATION_FLAG_FILE = path.join(__dirname, '..', '.migration-completed')

async function checkAndInitializeDatabase() {
  try {
    if (fs.existsSync(MIGRATION_FLAG_FILE)) {
      console.log('Database already initialized, skipping migration')
      return
    }

    console.log('First time startup detected, initializing database...')

    await prisma.$connect()
    console.log('Database connection successful')

    console.log('Applying database migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    console.log('Migrations applied successfully')

    fs.writeFileSync(MIGRATION_FLAG_FILE, new Date().toISOString())
    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Database initialization failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkAndInitializeDatabase()
}

module.exports = { checkAndInitializeDatabase }