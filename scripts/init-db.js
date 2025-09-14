const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const MIGRATION_FLAG_FILE = path.join(__dirname, '..', '.migration-completed');

async function checkAndInitializeDatabase() {
  try {
    // Check if migration has already been completed
    if (fs.existsSync(MIGRATION_FLAG_FILE)) {
      console.log('Database already initialized, skipping migration');
      return;
    }

    console.log('First time startup detected, initializing database...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Check if tables exist by trying to count users
    try {
      await prisma.user.count();
      console.log('Database tables already exist');
    } catch (error) {
      console.log('Database tables do not exist, they should be created by Prisma');
      throw error;
    }
    
    // Create migration flag file
    fs.writeFileSync(MIGRATION_FLAG_FILE, new Date().toISOString());
    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkAndInitializeDatabase();
}

module.exports = { checkAndInitializeDatabase };