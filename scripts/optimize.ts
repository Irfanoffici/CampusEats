/**
 * Production Optimization Checklist
 * Run this before deploying to production
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface CheckResult {
  category: string
  checks: Array<{ name: string; passed: boolean; message: string }>
}

const results: CheckResult[] = []

function addCheck(category: string, name: string, passed: boolean, message: string) {
  let categoryResult = results.find(r => r.category === category)
  if (!categoryResult) {
    categoryResult = { category, checks: [] }
    results.push(categoryResult)
  }
  categoryResult.checks.push({ name, passed, message })
}

async function checkEnvironment() {
  console.log('🔍 Checking Environment Configuration...\n')
  
  // Check .env.local exists
  const envExists = fs.existsSync('.env.local')
  addCheck('Environment', '.env.local file', envExists, envExists ? 'Found' : 'Missing')
  
  // Check required variables
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  required.forEach(varName => {
    const exists = !!process.env[varName]
    addCheck('Environment', varName, exists, exists ? 'Set' : 'Not set')
  })
  
  // Check Firebase (optional)
  const firebaseVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ]
  const firebaseConfigured = firebaseVars.every(v => !!process.env[v])
  addCheck('Environment', 'Firebase Fallback', firebaseConfigured, 
    firebaseConfigured ? 'Configured' : 'Not configured (optional)')
}

async function checkDatabase() {
  console.log('🔍 Checking Database...\n')
  
  try {
    await prisma.$connect()
    addCheck('Database', 'Connection', true, 'Connected successfully')
    
    // Check all tables exist and have data
    const tables = {
      'Users': await prisma.user.count(),
      'Vendors': await prisma.vendor.count(),
      'MenuItems': await prisma.menuItem.count(),
      'Orders': await prisma.order.count(),
    }
    
    Object.entries(tables).forEach(([table, count]) => {
      const hasData = count > 0
      addCheck('Database', `${table} table`, hasData, 
        hasData ? `${count} records` : 'Empty (run db:seed)')
    })
    
    // Check vendor-user relationships
    const vendorUsers = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      include: { vendor: true }
    })
    const allLinked = vendorUsers.every((u: any) => u.vendor)
    addCheck('Database', 'Vendor relationships', allLinked,
      allLinked ? 'All vendors linked' : 'Some vendors missing profiles')
    
  } catch (error: any) {
    addCheck('Database', 'Connection', false, error.message)
  }
}

async function checkFiles() {
  console.log('🔍 Checking Project Files...\n')
  
  const criticalFiles = [
    'package.json',
    'next.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    'prisma/schema.prisma',
    'app/api/auth/[...nextauth]/route.ts',
    'lib/auth.ts',
    'lib/prisma.ts',
    'lib/db-service.ts',
  ]
  
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(file)
    addCheck('Files', file, exists, exists ? 'Found' : 'Missing')
  })
}

async function checkSecurity() {
  console.log('🔍 Checking Security...\n')
  
  // Check NEXTAUTH_SECRET strength
  const secret = process.env.NEXTAUTH_SECRET || ''
  const strongSecret = secret.length >= 32
  addCheck('Security', 'NEXTAUTH_SECRET strength', strongSecret,
    strongSecret ? 'Strong (32+ chars)' : 'Weak (use 32+ random chars)')
  
  // Check if default secrets are being used
  const isDefault = secret === 'your-secret-key-here' || secret === 'change-me'
  addCheck('Security', 'Secret is unique', !isDefault,
    isDefault ? 'Using default secret (CHANGE IT!)' : 'Using custom secret')
  
  // Check if passwords are hashed
  try {
    const users = await prisma.user.findMany({ take: 1, select: { passwordHash: true } })
    const isHashed = users.length > 0 && users[0].passwordHash.startsWith('$2')
    addCheck('Security', 'Password hashing', isHashed,
      isHashed ? 'Passwords are hashed' : 'Passwords might not be hashed')
  } catch (error) {
    addCheck('Security', 'Password hashing', false, 'Could not verify')
  }
}

async function checkPerformance() {
  console.log('🔍 Checking Performance...\n')
  
  // Check if .next folder exists (built)
  const isBuilt = fs.existsSync('.next')
  addCheck('Performance', 'Production build', isBuilt,
    isBuilt ? 'Built (run npm run build to rebuild)' : 'Not built (run npm run build)')
  
  // Check node_modules size
  const nodeModulesExists = fs.existsSync('node_modules')
  addCheck('Performance', 'Dependencies installed', nodeModulesExists,
    nodeModulesExists ? 'Installed' : 'Run npm install')
  
  // Check for large database
  if (fs.existsSync('prisma/dev.db')) {
    const stats = fs.statSync('prisma/dev.db')
    const sizeMB = stats.size / (1024 * 1024)
    const reasonable = sizeMB < 100
    addCheck('Performance', 'Database size', reasonable,
      `${sizeMB.toFixed(2)} MB ${reasonable ? '(OK)' : '(Consider cleanup)'}`)
  }
}

async function checkAccessibility() {
  console.log('🔍 Checking Accessibility...\n')
  
  // Check if test accounts exist
  const testEmails = [
    'john.doe@mec.edu',
    'canteen@mec.edu',
    'admin@mec.edu'
  ]
  
  for (const email of testEmails) {
    const user = await prisma.user.findUnique({ where: { email } })
    addCheck('Accessibility', `Test account: ${email}`, !!user,
      user ? 'Exists' : 'Missing (run db:seed)')
  }
}

function printResults() {
  console.log('\n' + '='.repeat(70))
  console.log('📊 OPTIMIZATION REPORT\n')
  
  let totalChecks = 0
  let passedChecks = 0
  
  results.forEach(({ category, checks }) => {
    console.log(`\n${category}:`)
    checks.forEach(({ name, passed, message }) => {
      totalChecks++
      if (passed) passedChecks++
      const icon = passed ? '✅' : '❌'
      console.log(`  ${icon} ${name}: ${message}`)
    })
  })
  
  console.log('\n' + '='.repeat(70))
  
  const percentage = Math.round((passedChecks / totalChecks) * 100)
  console.log(`\n📈 Score: ${passedChecks}/${totalChecks} checks passed (${percentage}%)`)
  
  if (percentage === 100) {
    console.log('\n🎉 Perfect! Ready for production deployment!\n')
  } else if (percentage >= 80) {
    console.log('\n✅ Good! Address remaining issues before production.\n')
  } else {
    console.log('\n⚠️  Warning! Several issues need attention.\n')
  }
  
  // Critical issues
  const critical = results
    .flatMap(r => r.checks)
    .filter(c => !c.passed && (
      c.name.includes('Connection') ||
      c.name.includes('NEXTAUTH_SECRET') ||
      c.name.includes('Secret is unique')
    ))
  
  if (critical.length > 0) {
    console.log('🚨 CRITICAL ISSUES:\n')
    critical.forEach(({ name, message }) => {
      console.log(`   ❌ ${name}: ${message}`)
    })
    console.log('\nFix these before deploying!\n')
  }
}

async function main() {
  console.log('🚀 CampusEats Production Optimization Check\n')
  console.log('='.repeat(70) + '\n')
  
  await checkEnvironment()
  await checkDatabase()
  await checkFiles()
  await checkSecurity()
  await checkPerformance()
  await checkAccessibility()
  
  printResults()
  
  await prisma.$disconnect()
}

main().catch(error => {
  console.error('💥 Optimization check failed:', error)
  prisma.$disconnect()
  process.exit(1)
})
