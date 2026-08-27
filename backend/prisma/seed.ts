import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES = [
  'BUYER',
  'SELLER',
  'OWNER',
  'SERVICE_PROVIDER',
  'VETERINARIAN',
  'ADMIN',
];

const CATEGORIES = [
  { name: 'Pet Food', description: 'Food and treats for pets' },
  { name: 'Toys', description: 'Pet toys and entertainment' },
  { name: 'Beds & Furniture', description: 'Comfort items for pets' },
  { name: 'Grooming', description: 'Grooming and hygiene products' },
  { name: 'Accessories', description: 'Collars, leashes, and more' },
];

async function main() {
  console.log('Seeding database...');

  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  const adminPassword = await argon2.hash('Admin@123');
  const buyerPassword = await argon2.hash('Buyer@123');

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const buyerRole = await prisma.role.findUnique({ where: { name: 'BUYER' } });
  const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } });
  const sellerRole = await prisma.role.findUnique({ where: { name: 'SELLER' } });

  if (!adminRole || !buyerRole || !ownerRole || !sellerRole) {
    throw new Error('Roles not found');
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@petplatform.com' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@petplatform.com',
      passwordHash: adminPassword,
      emailVerified: true,
      roles: { create: [{ roleId: adminRole.id }] },
      cart: { create: {} },
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@petplatform.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@petplatform.com',
      phone: '+919876543210',
      passwordHash: buyerPassword,
      emailVerified: true,
      roles: {
        create: [
          { roleId: buyerRole.id },
          { roleId: ownerRole.id },
          { roleId: sellerRole.id },
        ],
      },
      cart: { create: {} },
    },
  });

  const existingPet = await prisma.pet.findFirst({
    where: { ownerId: demoUser.id, name: 'Bruno' },
  });

  if (!existingPet) {
    await prisma.pet.create({
      data: {
        ownerId: demoUser.id,
        name: 'Bruno',
        species: 'Dog',
        breed: 'Golden Retriever',
        gender: 'MALE',
        dateOfBirth: new Date('2022-03-15'),
        color: 'Golden',
        weight: 28.5,
        description: 'Friendly and well-trained golden retriever.',
        healthStatus: 'Healthy',
        status: 'ACTIVE',
        ownerships: {
          create: { userId: demoUser.id, ownershipType: 'PRIMARY' },
        },
        vaccinations: {
          create: [
            {
              vaccineName: 'Rabies',
              doseNumber: 1,
              administeredDate: new Date('2024-01-10'),
              nextDueDate: new Date('2025-01-10'),
              clinicName: 'Happy Paws Clinic',
              status: 'UP_TO_DATE',
            },
            {
              vaccineName: 'DHPP',
              doseNumber: 2,
              administeredDate: new Date('2024-06-01'),
              nextDueDate: new Date('2025-06-01'),
              clinicName: 'Happy Paws Clinic',
              status: 'UP_TO_DATE',
            },
          ],
        },
      },
    });
  }

  console.log('Seed completed.');
  console.log('Admin: admin@petplatform.com / Admin@123');
  console.log('Demo:  demo@petplatform.com / Buyer@123');
  console.log('Admin ID:', admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
