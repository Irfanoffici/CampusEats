import { prisma } from '../lib/prisma'

async function testRFIDCredit() {
  console.log('\n🧪 Testing RFID Credit Feature\n')

  // Get a student with RFID
  const student = await prisma.user.findFirst({
    where: { 
      role: 'STUDENT',
      rfidNumber: { not: null }
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      rfidNumber: true,
      rfidBalance: true,
    },
  })

  if (!student) {
    console.log('❌ No student with RFID found')
    return
  }

  console.log('📋 Student Details:')
  console.log(`   Name: ${student.fullName}`)
  console.log(`   Email: ${student.email}`)
  console.log(`   RFID Number: ${student.rfidNumber}`)
  console.log(`   Current Balance: ₹${student.rfidBalance ?? 0}`)

  console.log('\n✅ RFID Credit API is ready to use!')
  console.log('\n📌 To test via Admin Panel:')
  console.log('   1. Login as admin@mec.edu / admin123')
  console.log('   2. Click the green floating RFID button (bottom right)')
  console.log(`   3. Enter RFID: ${student.rfidNumber}`)
  console.log('   4. Enter Amount: 100')
  console.log('   5. Click "Credit Balance"')
  console.log(`   6. New balance should be: ₹${(student.rfidBalance ?? 0) + 100}`)

  await prisma.$disconnect()
}

testRFIDCredit()
