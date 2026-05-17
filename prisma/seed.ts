import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing data...');
  await prisma.teamMember.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.court.deleteMany();
  await prisma.operatingHour.deleteMany();
  await prisma.arenaSettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.arena.deleteMany();

  console.log('🌱 Seeding ArenaHub database...');

  const hashedPassword = await bcrypt.hash('arenahub', 10);

  // 1. Create 5 Arenas
  const arenaData = [
    { name: 'ArenaHub Central', taxId: '12.345.678/0001-90', email: 'contato@arenahub.com' },
    { name: 'Arena Beach Tennis', taxId: '22.345.678/0001-90', email: 'beach@arenahub.com' },
    { name: 'Padel Pro Arena', taxId: '32.345.678/0001-90', email: 'padel@arenahub.com' },
    { name: 'Futebol Society Club', taxId: '42.345.678/0001-90', email: 'futebol@arenahub.com' },
    { name: 'MultiSport Center', taxId: '52.345.678/0001-90', email: 'multi@arenahub.com' },
  ];

  const arenas = await Promise.all(
    arenaData.map(data => 
      prisma.arena.create({
        data: {
          ...data,
          phone: '(11) 99887-7665',
          address: 'Rua das Palmeiras, 450 - Jardim Paulista - Sao Paulo/SP',
        }
      })
    )
  );
  console.log(`✅ ${arenas.length} arenas created.`);

  const mainArena = arenas[0];

  // 2. Create Admin for Main Arena
  const adminUser = await prisma.user.create({
    data: {
      arenaId: mainArena.id,
      name: 'Administrador ArenaHub',
      email: 'admin@arenahub.com',
      password: hashedPassword,
      role: 'Administrator',
      status: 'Active',
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // 3. Create Courts for Main Arena
  const sports = ['Tenis', 'Padel', 'Futebol', 'Basquete'];
  const courts = await Promise.all(
    Array.from({ length: 6 }).map((_, i) => 
      prisma.court.create({
        data: {
          arenaId: mainArena.id,
          name: `Quadra ${i + 1}`,
          sport: sports[i % sports.length],
          coverType: i % 2 === 0 ? 'Closed' : 'Open',
          pricePerHour: 50 + (i * 10),
          status: i === 5 ? 'Maintenance' : 'Available',
          features: ['LED Lighting'],
        }
      })
    )
  );
  console.log(`✅ ${courts.length} courts created at Central Arena.`);

  // 4. Create 10 Customers (3 Inativo)
  const customerNames = [
    'Leonardo Albuquerque', 'Beatriz Nogueira', 'Gustavo Mendes', 'Carolina Soares',
    'Ricardo Pereira', 'Mariana Luz', 'Fernando Silva', 'Julia Costa',
    'Roberto Lima', 'Amanda Rocha'
  ];

  const customers = await Promise.all(
    customerNames.map((name, i) => 
      prisma.customer.create({
        data: {
          arenaId: mainArena.id,
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@exemplo.com`,
          phone: `(11) 9${i}844-3322`,
          type: i % 3 === 0 ? 'Monthly' : 'Casual',
          status: i < 3 ? 'Inactive' : 'Active',
          favoriteSport: sports[i % sports.length],
          totalSpent: Math.floor(Math.random() * 5000),
          reservationsCount: Math.floor(Math.random() * 50),
        }
      })
    )
  );
  console.log(`✅ ${customers.length} customers created (3 inactive).`);

  // 5. Create 7 Reservations
  const reservationData = [
    { start: '18:00', end: '19:00', status: 'Confirmed' },
    { start: '19:00', end: '20:30', status: 'Confirmed' },
    { start: '20:00', end: '21:00', status: 'Pending' },
    { start: '17:00', end: '18:30', status: 'Confirmed' },
    { start: '08:00', end: '09:00', status: 'Cancelled' },
    { start: '10:00', end: '11:00', status: 'Confirmed' },
    { start: '21:00', end: '22:00', status: 'Pending' },
  ];

  const activeCustomers = customers.filter(c => c.status === 'Active');
  const availableCourts = courts.filter(c => c.status !== 'Maintenance');

  await Promise.all(
    reservationData.map((data, i) => 
      prisma.reservation.create({
        data: {
          arenaId: mainArena.id,
          customerId: activeCustomers[i % activeCustomers.length].id,
          courtId: availableCourts[i % availableCourts.length].id,
          sport: availableCourts[i % availableCourts.length].sport,
          date: new Date(),
          startTime: data.start,
          endTime: data.end,
          amount: availableCourts[i % availableCourts.length].pricePerHour,
          status: data.status as any,
        }
      })
    )
  );
  console.log(`✅ 7 reservations created.`);

  // 6. Settings and Hours
  const settings = await prisma.arenaSettings.create({
    data: {
      arenaId: mainArena.id,
      reservationReminder: true,
      pix: true,
      creditCard: true,
      cash: true,
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  await prisma.operatingHour.createMany({
    data: days.map(day => ({
      settingsId: settings.id,
      day,
      enabled: true,
      open: '08:00',
      close: '22:00',
    }))
  });

  // 7. Team Members
  await prisma.teamMember.createMany({
    data: [
      { arenaId: mainArena.id, name: 'Ricardo Staff', email: 'ricardo@staff.com', role: 'Manager', status: 'Active' },
      { arenaId: mainArena.id, name: 'Ana Reception', email: 'ana@staff.com', role: 'Reception', status: 'Active' },
    ]
  });

  console.log('\n🏟️  Seed updated successfully!');
  console.log(`   Main Login: admin@arenahub.com / arenahub`);
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
