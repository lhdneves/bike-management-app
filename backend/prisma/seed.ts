import { PrismaClient, UserRole, BikeType, TractionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bikemanager.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@bikemanager.com',
      passwordHash: adminPasswordHash,
      phoneNumber: '+55 11 99999-9999',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample bike owner
  const ownerPasswordHash = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'owner@example.com',
      passwordHash: ownerPasswordHash,
      phoneNumber: '+55 11 98765-4321',
      role: UserRole.BIKE_OWNER,
    },
  });

  console.log('✅ Bike owner created:', owner.email);

  // Create sample mechanic user
  const mechanicPasswordHash = await bcrypt.hash('mechanic123', 10);
  const mechanicUser = await prisma.user.upsert({
    where: { email: 'mechanic@example.com' },
    update: {},
    create: {
      name: 'Carlos Mecânico',
      email: 'mechanic@example.com',
      passwordHash: mechanicPasswordHash,
      phoneNumber: '+55 11 97654-3210',
      role: UserRole.MECHANIC,
    },
  });

  console.log('✅ Mechanic user created:', mechanicUser.email);

  // Create mechanic profile
  const mechanic = await prisma.mechanic.upsert({
    where: { userId: mechanicUser.id },
    update: {},
    create: {
      userId: mechanicUser.id,
      address: 'Rua das Bicicletas, 123 - São Paulo, SP',
      phone: '+55 11 97654-3210',
      openingHours: 'Segunda a Sexta: 8h às 18h, Sábado: 8h às 12h',
      rating: 4.8,
    },
  });

  console.log('✅ Mechanic profile created');

  // Create sample bikes for the owner
  const bike1 = await prisma.bike.create({
    data: {
      ownerId: owner.id,
      name: 'Minha Mountain Bike',
      description: 'Specialized Rockhopper 29er',
      manufacturer: 'Specialized',
      type: BikeType.MOUNTAIN_BIKE,
      tractionType: TractionType.MANUAL,
    },
  });

  const bike2 = await prisma.bike.create({
    data: {
      ownerId: owner.id,
      name: 'Speed para Treinos',
      description: 'Caloi 10 Vintage',
      manufacturer: 'Caloi',
      type: BikeType.SPEED,
      tractionType: TractionType.MANUAL,
    },
  });

  console.log('✅ Sample bikes created');

  // Create sample components
  await prisma.component.createMany({
    data: [
      {
        bikeId: bike1.id,
        name: 'Pneu Dianteiro',
        description: 'Maxxis Minion DHF 29x2.3',
        installationDate: new Date('2023-06-15'),
        observation: 'Pneu novo, boa aderência',
      },
      {
        bikeId: bike1.id,
        name: 'Pneu Traseiro',
        description: 'Maxxis Minion DHR 29x2.3',
        installationDate: new Date('2023-06-15'),
        observation: 'Pneu novo, boa aderência',
      },
      {
        bikeId: bike1.id,
        name: 'Corrente',
        description: 'SRAM PC-1110 11 velocidades',
        installationDate: new Date('2023-08-20'),
        observation: 'Corrente substituída após desgaste',
      },
      {
        bikeId: bike2.id,
        name: 'Pneu Dianteiro',
        description: 'Continental GP 5000 700x25c',
        installationDate: new Date('2023-07-10'),
        observation: 'Pneu de alta performance',
      },
      {
        bikeId: bike2.id,
        name: 'Corrente',
        description: 'Shimano Ultegra CN-HG701',
        installationDate: new Date('2023-09-05'),
        observation: 'Corrente de qualidade superior',
      },
    ],
  });

  console.log('✅ Sample components created');

  // Create sample maintenance records
  await prisma.maintenanceRecord.createMany({
    data: [
      {
        bikeId: bike1.id,
        mechanicId: mechanic.id,
        serviceDate: new Date('2023-08-20'),
        serviceDescription: 'Troca de corrente e ajuste de câmbio',
        cost: 120.50,
      },
      {
        bikeId: bike1.id,
        mechanicId: mechanic.id,
        serviceDate: new Date('2023-06-15'),
        serviceDescription: 'Troca de pneus dianteiro e traseiro',
        cost: 180.00,
      },
      {
        bikeId: bike2.id,
        mechanicId: mechanic.id,
        serviceDate: new Date('2023-09-05'),
        serviceDescription: 'Revisão completa e troca de corrente',
        cost: 200.00,
      },
    ],
  });

  console.log('✅ Sample maintenance records created');

  // Create sample scheduled maintenance
  await prisma.scheduledMaintenance.createMany({
    data: [
      {
        bikeId: bike1.id,
        scheduledDate: new Date('2024-02-15'),
        serviceDescription: 'Revisão de 6 meses - verificação geral',
        notificationDaysBefore: 7,
        isCompleted: false,
      },
      {
        bikeId: bike2.id,
        scheduledDate: new Date('2024-03-05'),
        serviceDescription: 'Lubrificação da corrente e ajustes',
        notificationDaysBefore: 3,
        isCompleted: false,
      },
    ],
  });

  console.log('✅ Sample scheduled maintenance created');

  // Create sample banners
  await prisma.banner.createMany({
    data: [
      {
        imageUrl: 'https://example.com/banner-bike-sale.jpg',
        targetUrl: 'https://example.com/bike-sale',
        description: 'Promoção de bicicletas - 20% de desconto',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        isActive: true,
        tags: ['promocao', 'bicicletas'],
      },
      {
        imageUrl: 'https://example.com/banner-maintenance.jpg',
        targetUrl: 'https://example.com/maintenance-service',
        description: 'Serviços de manutenção profissional',
        isActive: true,
        tags: ['manutencao', 'servicos'],
      },
    ],
  });

  console.log('✅ Sample banners created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📧 Test accounts created:');
  console.log('Admin: admin@bikemanager.com / admin123');
  console.log('Owner: owner@example.com / owner123');
  console.log('Mechanic: mechanic@example.com / mechanic123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });