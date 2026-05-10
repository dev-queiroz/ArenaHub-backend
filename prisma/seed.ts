import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed script to populate the database with initial demo data.
 * Creates one arena (tenant), an admin user, courts, customers,
 * reservations, settings, operating hours, and team members.
 */
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

  // 1. Create Arena (Tenant)
  const arena = await prisma.arena.create({
    data: {
      name: 'ArenaHub Central',
      taxId: '12.345.678/0001-90',
      email: 'contato@arenahub.com',
      phone: '(11) 99887-7665',
      address: 'Rua das Palmeiras, 450 - Jardim Paulista - Sao Paulo/SP',
    },
  });
  console.log(`✅ Arena criada: ${arena.name} (${arena.id})`);

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('arenahub', 10);
  const adminUser = await prisma.user.create({
    data: {
      arenaId: arena.id,
      name: 'Administrador ArenaHub',
      email: 'admin@arenahub.com',
      password: hashedPassword,
      role: 'Administrador',
      status: 'Ativo',
    },
  });
  console.log(`✅ Usuário admin criado: ${adminUser.email}`);

  // 3. Create Courts
  const courts = await Promise.all([
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Quadra 01',
        sport: 'Tenis',
        coverType: 'Fechada',
        zipCode: '05432-001',
        city: 'São Paulo',
        address: 'Av. Paulista',
        number: '1000',
        pricePerHour: 60,
        status: 'Disponivel',
        features: ['Iluminacao LED', 'Arquibancada'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Quadra 02',
        sport: 'Padel',
        coverType: 'Fechada',
        zipCode: '05432-001',
        city: 'São Paulo',
        address: 'Av. Paulista',
        number: '1000',
        pricePerHour: 80,
        status: 'Ocupada',
        features: ['Vidro panoramico', 'Placar digital'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Arena Principal',
        sport: 'Futebol',
        coverType: 'Aberta',
        zipCode: '05432-001',
        city: 'São Paulo',
        address: 'Rua das Palmeiras',
        number: '450',
        pricePerHour: 150,
        status: 'Disponivel',
        features: ['Arquibancada', 'Bar lateral'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Ginasio Central',
        sport: 'Basquete',
        coverType: 'Fechada',
        zipCode: '05432-001',
        city: 'São Paulo',
        address: 'Rua das Palmeiras',
        number: '450',
        pricePerHour: 100,
        status: 'Manutencao',
        features: ['Ar-condicionado', 'Placar oficial'],
      },
    }),
  ]);
  console.log(`✅ ${courts.length} quadras criadas`);

  // 4. Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        arenaId: arena.id,
        name: 'Leonardo Albuquerque',
        email: 'leo@arenahub.com',
        phone: '(11) 98844-3322',
        type: 'Mensalista',
        status: 'Ativo',
        favoriteSport: 'Padel',
        totalSpent: 3450,
        reservationsCount: 48,
        notes: 'Cliente com alta recorrencia e baixo indice de cancelamento.',
      },
    }),
    prisma.customer.create({
      data: {
        arenaId: arena.id,
        name: 'Beatriz Nogueira',
        email: 'beatriz@arenahub.com',
        phone: '(11) 97766-5544',
        type: 'Avulso',
        status: 'Ativo',
        favoriteSport: 'Tenis',
        totalSpent: 840,
        reservationsCount: 12,
      },
    }),
    prisma.customer.create({
      data: {
        arenaId: arena.id,
        name: 'Gustavo Mendes',
        email: 'gustavo@arenahub.com',
        phone: '(11) 96655-4433',
        type: 'Mensalista',
        status: 'Ativo',
        favoriteSport: 'Futebol',
        totalSpent: 2100,
        reservationsCount: 35,
      },
    }),
    prisma.customer.create({
      data: {
        arenaId: arena.id,
        name: 'Carolina Soares',
        email: 'carolina@arenahub.com',
        phone: '(11) 95544-3322',
        type: 'Avulso',
        status: 'Inativo',
        favoriteSport: 'Padel',
        totalSpent: 210,
        reservationsCount: 3,
      },
    }),
  ]);
  console.log(`✅ ${customers.length} clientes criados`);

  // 5. Create Reservations
  const reservations = await Promise.all([
    prisma.reservation.create({
      data: {
        arenaId: arena.id,
        customerId: customers[0].id,
        courtId: courts[1].id,
        sport: 'Padel',
        date: new Date('2026-05-10'),
        startTime: '18:00',
        endTime: '19:30',
        amount: 120,
        status: 'Confirmado',
        notes: 'Cliente prefere material premium.',
      },
    }),
    prisma.reservation.create({
      data: {
        arenaId: arena.id,
        customerId: customers[1].id,
        courtId: courts[0].id,
        sport: 'Tenis',
        date: new Date('2026-05-10'),
        startTime: '19:00',
        endTime: '20:00',
        amount: 60,
        status: 'Pendente',
      },
    }),
    prisma.reservation.create({
      data: {
        arenaId: arena.id,
        customerId: customers[2].id,
        courtId: courts[2].id,
        sport: 'Futebol',
        date: new Date('2026-05-11'),
        startTime: '20:00',
        endTime: '21:00',
        amount: 150,
        status: 'Confirmado',
      },
    }),
  ]);
  console.log(`✅ ${reservations.length} reservas criadas`);

  // 6. Create Arena Settings
  const settings = await prisma.arenaSettings.create({
    data: {
      arenaId: arena.id,
      reservationReminder: true,
      paymentConfirmation: true,
      cancellationAlert: true,
      marketingCampaigns: false,
      pix: true,
      creditCard: true,
      debitCard: true,
      cash: true,
      bankTransfer: false,
    },
  });

  // 7. Create Operating Hours
  const days = [
    { day: 'Segunda', open: '08:00', close: '22:00' },
    { day: 'Terça', open: '08:00', close: '22:00' },
    { day: 'Quarta', open: '08:00', close: '22:00' },
    { day: 'Quinta', open: '08:00', close: '22:00' },
    { day: 'Sexta', open: '08:00', close: '23:00' },
    { day: 'Sábado', open: '07:00', close: '23:00' },
    { day: 'Domingo', open: '07:00', close: '20:00' },
  ];
  await prisma.operatingHour.createMany({
    data: days.map((d) => ({
      settingsId: settings.id,
      day: d.day,
      enabled: true,
      open: d.open,
      close: d.close,
    })),
  });
  console.log('✅ Horários de funcionamento criados');

  // 8. Create Team Members
  await prisma.teamMember.createMany({
    data: [
      {
        arenaId: arena.id,
        name: 'Ricardo Oliveira',
        email: 'ricardo@arenahub.com',
        role: 'Administrador',
        status: 'Ativo',
      },
      {
        arenaId: arena.id,
        name: 'Juliana Santos',
        email: 'juliana@arenahub.com',
        role: 'Gerente',
        status: 'Ativo',
      },
      {
        arenaId: arena.id,
        name: 'Amanda Costa',
        email: 'amanda@arenahub.com',
        role: 'Recepcao',
        status: 'Convite pendente',
      },
    ],
  });
  console.log('✅ Membros da equipe criados');

  console.log('\n🏟️  Seed concluído com sucesso!');
  console.log(`   Arena ID: ${arena.id}`);
  console.log(`   Login: admin@arenahub.com / arenahub`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
