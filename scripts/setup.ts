#!/usr/bin/env node

/**
 * CampusEats Setup & Verification Script
 * 
 * This script:
 * 1. Verifies environment configuration
 * 2. Sets up the database
 * 3. Seeds initial data
 * 4. Runs system tests
 * 5. Checks database health
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

const FIREBASE_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
]

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`)
}

function step(number: number, title: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${number}️⃣  ${title}`)
  console.log('='.repeat(60))
}

function runCommand(command: string, description: string) {
  try {
    log('⚙️ ', description)
    execSync(command, { stdio: 'inherit' })
    log('✅', `${description} - DONE`)
    return true
  } catch (error) {
    log('❌', `${description} - FAILED`)
    return false
  }
}

async function main() {
  console.log('\n🚀 CampusEats Setup & Verification\n')
  
  // Step 1: Environment Check
  step(1, 'Checking Environment Configuration')
  
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    log('⚠️ ', '.env.local not found - creating from .env.example')
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', envPath)
      log('✅', 'Created .env.local')
    } else {
      log('❌', 'No .env.example found. Please create .env.local manually.')
      process.exit(1)
    }
  } else {
    log('✅', 'Found .env.local')
  }
  
  // Check required environment variables
  const missingVars: string[] = []
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length > 0) {
    log('⚠️ ', `Missing required environment variables: ${missingVars.join(', ')}`)
    log('ℹ️ ', 'Please add them to .env.local')
  } else {
    log('✅', 'All required environment variables found')
  }
  
  // Check Firebase configuration (optional)
  const firebaseMissing = FIREBASE_ENV_VARS.filter(v => !process.env[v])
  if (firebaseMissing.length > 0) {
    log('ℹ️ ', 'Firebase not configured (optional fallback)')
  } else {
    log('✅', 'Firebase configuration found')
  }
  
  // Step 2: Dependencies
  step(2, 'Installing Dependencies')
  
  if (!fs.existsSync('node_modules')) {
    runCommand('npm install', 'Installing packages')
  } else {
    log('✅', 'Dependencies already installed')
  }
  
  // Step 3: Database Setup
  step(3, 'Setting Up Database')
  
  if (!runCommand('npm run db:push', 'Pushing database schema')) {
    log('❌', 'Database setup failed')
    process.exit(1)
  }
  
  // Step 4: Seed Data
  step(4, 'Seeding Database')
  
  if (!runCommand('npm run db:seed', 'Seeding initial data')) {
    log('⚠️ ', 'Seeding failed - database might already be seeded')
  }
  
  // Step 5: Database Health Check
  step(5, 'Database Health Check')
  
  if (!runCommand('npm run db:health', 'Checking database health')) {
    log('❌', 'Health check failed')
    process.exit(1)
  }
  
  // Step 6: Run Tests
  step(6, 'Running System Tests')
  
  if (!runCommand('npm test', 'Running test suite')) {
    log('❌', 'Tests failed')
    process.exit(1)
  }
  
  // Step 7: Build Check
  step(7, 'Verifying Build')
  
  if (!runCommand('npm run build', 'Building for production')) {
    log('❌', 'Build failed')
    process.exit(1)
  }
  
  // Step 8: Summary
  step(8, 'Setup Complete!')
  
  console.log('\n✅ CampusEats is ready to use!\n')
  console.log('📝 Next steps:\n')
  console.log('   1. Start development server:')
  console.log('      npm run dev\n')
  console.log('   2. Login credentials:\n')
  console.log('      👨‍🎓 Student:  john.doe@mec.edu / student123')
  console.log('      🏪 Vendor:   canteen@mec.edu / vendor123')
  console.log('      🔑 Admin:    admin@mec.edu / admin123\n')
  console.log('   3. Available commands:')
  console.log('      npm run dev       - Start development server')
  console.log('      npm run build     - Build for production')
  console.log('      npm start         - Start production server')
  console.log('      npm test          - Run system tests')
  console.log('      npm run db:health - Check database health')
  console.log('      npm run db:seed   - Reseed database\n')
  console.log('🎉 Happy coding!\n')
}

main().catch(error => {
  console.error('💥 Setup failed:', error)
  process.exit(1)
})
