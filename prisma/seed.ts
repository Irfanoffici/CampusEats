import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.transaction.deleteMany()
  await prisma.review.deleteMany()
  await prisma.order.deleteMany()
  await prisma.groupOrder.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.user.deleteMany()

  // Create Students
  const student1 = await prisma.user.create({
    data: {
      email: 'john.doe@mec.edu',
      passwordHash: await bcrypt.hash('student123', 10),
      role: 'STUDENT',
      rfidNumber: '1234567890',
      rfidBalance: 500,
      fullName: 'John Doe',
      phoneNumber: '9876543210',
    },
  })

  const student2 = await prisma.user.create({
    data: {
      email: 'jane.smith@mec.edu',
      passwordHash: await bcrypt.hash('student123', 10),
      role: 'STUDENT',
      rfidNumber: '0987654321',
      rfidBalance: 750,
      fullName: 'Jane Smith',
      phoneNumber: '9876543211',
    },
  })

  const student3 = await prisma.user.create({
    data: {
      email: 'alex.kumar@mec.edu',
      passwordHash: await bcrypt.hash('student123', 10),
      role: 'STUDENT',
      rfidNumber: '1122334455',
      rfidBalance: 300,
      fullName: 'Alex Kumar',
      phoneNumber: '9876543212',
    },
  })

  // Create Vendor Users
  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'canteen@mec.edu',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'VENDOR',
      fullName: 'Campus Canteen Manager',
      phoneNumber: '9876543220',
    },
  })

  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'quickbites@mec.edu',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'VENDOR',
      fullName: 'Quick Bites Manager',
      phoneNumber: '9876543221',
    },
  })

  const vendorUser3 = await prisma.user.create({
    data: {
      email: 'juice@mec.edu',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'VENDOR',
      fullName: 'Juice Junction Manager',
      phoneNumber: '9876543222',
    },
  })

  const vendorUser4 = await prisma.user.create({
    data: {
      email: 'dosa@mec.edu',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'VENDOR',
      fullName: 'Dosa Point Manager',
      phoneNumber: '9876543223',
    },
  })

  // Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@mec.edu',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      fullName: 'System Administrator',
      phoneNumber: '9876543230',
    },
  })

  // Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      shopName: 'Campus Canteen',
      description: 'Authentic North & South Indian cuisine, perfect for lunch and dinner',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      averageRating: 4.5,
      totalReviews: 128,
      isActive: true,
      openingHours: '7:00 AM - 9:00 PM',
    },
  })

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      shopName: 'Quick Bites',
      description: 'Fast food favorites - Burgers, Sandwiches, and more!',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      averageRating: 4.2,
      totalReviews: 95,
      isActive: true,
      openingHours: '8:00 AM - 8:00 PM',
    },
  })

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendorUser3.id,
      shopName: 'Juice Junction',
      description: 'Fresh juices, smoothies, and healthy drinks',
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      averageRating: 4.7,
      totalReviews: 76,
      isActive: true,
      openingHours: '7:00 AM - 7:00 PM',
    },
  })

  const vendor4 = await prisma.vendor.create({
    data: {
      userId: vendorUser4.id,
      shopName: 'Dosa Point',
      description: 'Crispy dosas and South Indian breakfast specialties',
      imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
      averageRating: 4.6,
      totalReviews: 142,
      isActive: true,
      openingHours: '6:00 AM - 11:00 AM',
    },
  })

  // Create Menu Items for Campus Canteen
  await prisma.menuItem.createMany({
    data: [
      {
        vendorId: vendor1.id,
        name: 'Veg Biryani',
        description: 'Aromatic basmati rice cooked with mixed vegetables and spices',
        price: 80,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
        category: 'LUNCH',
        isAvailable: true,
        preparationTime: 20,
      },
      {
        vendorId: vendor1.id,
        name: 'Paneer Butter Masala',
        description: 'Rich and creamy cottage cheese curry',
        price: 120,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
        category: 'LUNCH',
        isAvailable: true,
        preparationTime: 15,
      },
      {
        vendorId: vendor1.id,
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potato filling',
        price: 40,
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300',
        category: 'BREAKFAST',
        isAvailable: true,
        preparationTime: 15,
      },
      {
        vendorId: vendor1.id,
        name: 'Idli Sambar',
        description: 'Steamed rice cakes served with lentil curry',
        price: 30,
        imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300',
        category: 'BREAKFAST',
        isAvailable: true,
        preparationTime: 10,
      },
      {
        vendorId: vendor1.id,
        name: 'Chai Tea',
        description: 'Traditional Indian spiced tea',
        price: 10,
        imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300',
        category: 'BEVERAGES',
        isAvailable: true,
        preparationTime: 2,
      },
    ],
  })

  // Create Menu Items for Quick Bites
  await prisma.menuItem.createMany({
    data: [
      {
        vendorId: vendor2.id,
        name: 'Veg Burger',
        description: 'Grilled veggie patty with fresh lettuce and tomatoes',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300',
        category: 'SNACKS',
        isAvailable: true,
        preparationTime: 8,
      },
      {
        vendorId: vendor2.id,
        name: 'Cheese Sandwich',
        description: 'Grilled sandwich loaded with cheese',
        price: 40,
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300',
        category: 'SNACKS',
        isAvailable: true,
        preparationTime: 5,
      },
      {
        vendorId: vendor2.id,
        name: 'French Fries',
        description: 'Crispy golden fries with seasoning',
        price: 35,
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300',
        category: 'SNACKS',
        isAvailable: true,
        preparationTime: 7,
      },
      {
        vendorId: vendor2.id,
        name: 'Chicken Pizza',
        description: 'Loaded with chicken, cheese and vegetables',
        price: 150,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300',
        category: 'SNACKS',
        isAvailable: true,
        preparationTime: 15,
      },
    ],
  })

  // Create Menu Items for Juice Junction
  await prisma.menuItem.createMany({
    data: [
      {
        vendorId: vendor3.id,
        name: 'Mango Smoothie',
        description: 'Fresh mango blended with yogurt',
        price: 60,
        imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300',
        category: 'BEVERAGES',
        isAvailable: true,
        preparationTime: 5,
      },
      {
        vendorId: vendor3.id,
        name: 'Watermelon Juice',
        description: 'Refreshing fresh watermelon juice',
        price: 40,
        imageUrl: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=300',
        category: 'BEVERAGES',
        isAvailable: true,
        preparationTime: 3,
      },
      {
        vendorId: vendor3.id,
        name: 'Mixed Fruit Bowl',
        description: 'Assorted seasonal fruits',
        price: 80,
        imageUrl: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=300',
        category: 'DESSERTS',
        isAvailable: true,
        preparationTime: 8,
      },
    ],
  })

  // Create Menu Items for Dosa Point
  await prisma.menuItem.createMany({
    data: [
      {
        vendorId: vendor4.id,
        name: 'Plain Dosa',
        description: 'Crispy golden rice crepe',
        price: 30,
        imageUrl: 'https://images.unsplash.com/photo-1694675856588-63f5d08349e2?w=300',
        category: 'BREAKFAST',
        isAvailable: true,
        preparationTime: 12,
      },
      {
        vendorId: vendor4.id,
        name: 'Mysore Masala Dosa',
        description: 'Spicy chutney spread dosa with potato filling',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300',
        category: 'BREAKFAST',
        isAvailable: true,
        preparationTime: 15,
      },
      {
        vendorId: vendor4.id,
        name: 'Medu Vada',
        description: 'Crispy lentil fritters',
        price: 25,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300',
        category: 'BREAKFAST',
        isAvailable: true,
        preparationTime: 10,
      },
      {
        vendorId: vendor4.id,
        name: 'Filter Coffee',
        description: 'Traditional South Indian coffee',
        price: 15,
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=300',
        category: 'BEVERAGES',
        isAvailable: true,
        preparationTime: 3,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Test Credentials:')
  console.log('Student: john.doe@mec.edu / student123 (RFID: 1234567890)')
  console.log('Vendor: canteen@mec.edu / vendor123')
  console.log('Admin: admin@mec.edu / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
