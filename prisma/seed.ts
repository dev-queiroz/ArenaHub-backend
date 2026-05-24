import { PrismaClient, ReservationStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const adminPassword = 'arenahub';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function addDays(baseDate: Date, amount: number) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + amount);
  return date;
}

function atUtcMidnight(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

async function main() {
  console.log('Clearing existing ArenaHub data...');
  await prisma.teamMember.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.court.deleteMany();
  await prisma.operatingHour.deleteMany();
  await prisma.arenaSettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.arena.deleteMany();

  console.log('Seeding a single realistic arena with one admin...');

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  const nextWeek = addDays(today, 7);
  const maintenanceStart = addDays(today, 3);
  const maintenanceEnd = addDays(today, 6);

  const arena = await prisma.arena.create({
    data: {
      name: 'Arena Atlântica',
      taxId: '48.215.903/0001-61',
      email: 'contato@arenaatlantica.com.br',
      phone: '(85) 99814-2236',
      address: 'Av. Santos Dumont, 4550 - Aldeota - Fortaleza/CE',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      arenaId: arena.id,
      name: 'Gabriel Teixeira',
      email: 'admin@arenaatlantica.com.br',
      password: hashedPassword,
      role: UserRole.Administrator,
      status: 'Active',
      phone: '(85) 99901-7744',
    },
  });

  console.log(`Admin created: ${adminUser.email}`);

  const courts = await Promise.all([
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Padel Atlântico',
        sport: 'Padel',
        coverType: 'Closed',
        pricePerHour: 140,
        status: 'Available',
        features: ['Iluminação em LED', 'Gramado sintético lateral', 'Câmera para replay'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Padel Dunas',
        sport: 'Padel',
        coverType: 'Open',
        pricePerHour: 120,
        status: 'Available',
        features: ['Iluminação em LED', 'Arquibancada para 20 pessoas'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Beach Arena Sol',
        sport: 'Beach Tennis',
        coverType: 'Open',
        pricePerHour: 95,
        status: 'Available',
        features: ['Areia tratada', 'Som ambiente', 'Ducha lateral'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Beach Arena Mar',
        sport: 'Beach Tennis',
        coverType: 'Open',
        pricePerHour: 95,
        status: 'Available',
        features: ['Areia tratada', 'Refletores profissionais'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Society Farol',
        sport: 'Futebol Society',
        coverType: 'Closed',
        pricePerHour: 220,
        status: 'Available',
        features: ['Gramado premium', 'Placar digital', 'Banco de reservas'],
      },
    }),
    prisma.court.create({
      data: {
        arenaId: arena.id,
        name: 'Tênis Brisa',
        sport: 'Tênis',
        coverType: 'Closed',
        pricePerHour: 160,
        status: 'Maintenance',
        maintenanceStart,
        maintenanceEnd,
        features: ['Piso rápido', 'Iluminação profissional', 'Área de aquecimento'],
      },
    }),
  ]);

  console.log(`${courts.length} courts created.`);

  const customersSeed = [
    {
      name: 'Marina Albuquerque',
      email: 'marina.albuquerque@gmail.com',
      phone: '(85) 98811-3401',
      type: 'Monthly',
      status: 'Active',
      favoriteSport: 'Padel',
      level: 'Advanced',
      notes: 'Joga no horário do almoço e costuma reservar com 2 dias de antecedência.',
    },
    {
      name: 'Caio Menezes',
      email: 'caio.menezes@gmail.com',
      phone: '(85) 98814-2208',
      type: 'Monthly',
      status: 'Active',
      favoriteSport: 'Beach Tennis',
      level: 'Intermediate',
      notes: 'Participa das aulas de terça e quinta.',
    },
    {
      name: 'Larissa Viana',
      email: 'larissa.viana@gmail.com',
      phone: '(85) 98772-5513',
      type: 'Casual',
      status: 'Active',
      favoriteSport: 'Padel',
      level: 'Beginner',
      notes: 'Cliente nova, veio por indicação de Marina.',
    },
    {
      name: 'Pedro Valença',
      email: 'pedro.valenca@gmail.com',
      phone: '(85) 98901-6635',
      type: 'Monthly',
      status: 'Active',
      favoriteSport: 'Futebol Society',
      level: 'Advanced',
      notes: 'Responsável pelo grupo das quintas à noite.',
    },
    {
      name: 'Bianca Sampaio',
      email: 'bianca.sampaio@gmail.com',
      phone: '(85) 98944-1180',
      type: 'Casual',
      status: 'Active',
      favoriteSport: 'Beach Tennis',
      level: 'Intermediate',
      notes: 'Prefere quadras abertas.',
    },
    {
      name: 'João Victor Matos',
      email: 'joaovictor.matos@gmail.com',
      phone: '(85) 98666-3302',
      type: 'Monthly',
      status: 'Active',
      favoriteSport: 'Tênis',
      level: 'Pro',
      notes: 'Está aguardando o fim da manutenção da quadra de tênis.',
    },
    {
      name: 'Helena Prado',
      email: 'helena.prado@gmail.com',
      phone: '(85) 98513-4471',
      type: 'Casual',
      status: 'Active',
      favoriteSport: 'Padel',
      level: 'Intermediate',
      notes: 'Costuma consumir água e isotônico.',
    },
    {
      name: 'Rafael Holanda',
      email: 'rafael.holanda@gmail.com',
      phone: '(85) 98890-5517',
      type: 'Monthly',
      status: 'Inactive',
      favoriteSport: 'Futebol Society',
      level: 'Advanced',
      notes: 'Plano pausado temporariamente.',
    },
    {
      name: 'Sofia Queiroz',
      email: 'sofia.queiroz@gmail.com',
      phone: '(85) 98701-8054',
      type: 'Casual',
      status: 'Active',
      favoriteSport: 'Beach Tennis',
      level: 'Beginner',
      notes: 'Faz reservas para o fim da tarde.',
    },
    {
      name: 'Thiago Barreto',
      email: 'thiago.barreto@gmail.com',
      phone: '(85) 98972-1903',
      type: 'Casual',
      status: 'Active',
      favoriteSport: 'Padel',
      level: 'Intermediate',
      notes: 'Geralmente fecha dupla com Caio.',
    },
  ] as const;

  const customers = await Promise.all(
    customersSeed.map((customer) =>
      prisma.customer.create({
        data: {
          arenaId: arena.id,
          ...customer,
          totalSpent: 0,
          reservationsCount: 0,
        },
      }),
    ),
  );

  console.log(`${customers.length} customers created.`);

  const customerByName = Object.fromEntries(customers.map((customer) => [customer.name, customer]));
  const courtByName = Object.fromEntries(courts.map((court) => [court.name, court]));

  const reservationsSeed = [
    {
      customerName: 'Marina Albuquerque',
      courtName: 'Padel Atlântico',
      date: today,
      startTime: '07:00',
      endTime: '08:30',
      status: ReservationStatus.Confirmed,
      isOpen: false,
      notes: 'Treino técnico com professor particular.',
      consumption: [
        { description: 'Água sem gás', quantity: 2, price: 6 },
      ],
    },
    {
      customerName: 'Caio Menezes',
      courtName: 'Beach Arena Sol',
      date: today,
      startTime: '18:00',
      endTime: '19:30',
      status: ReservationStatus.Confirmed,
      isOpen: true,
      notes: 'Aberta para encaixar dupla visitante.',
      consumption: [
        { description: 'Isotônico', quantity: 2, price: 9 },
        { description: 'Aluguel de raquete', quantity: 1, price: 18 },
      ],
    },
    {
      customerName: 'Larissa Viana',
      courtName: 'Padel Dunas',
      date: today,
      startTime: '20:00',
      endTime: '21:00',
      status: ReservationStatus.Pending,
      isOpen: false,
      notes: 'Aguardando confirmação do PIX.',
      consumption: [],
    },
    {
      customerName: 'Pedro Valença',
      courtName: 'Society Farol',
      date: tomorrow,
      startTime: '19:00',
      endTime: '20:30',
      status: ReservationStatus.Confirmed,
      isOpen: false,
      notes: 'Pelada fixa da turma do escritório.',
      consumption: [
        { description: 'Cooler com água', quantity: 1, price: 28 },
      ],
    },
    {
      customerName: 'Bianca Sampaio',
      courtName: 'Beach Arena Mar',
      date: tomorrow,
      startTime: '17:30',
      endTime: '18:30',
      status: ReservationStatus.Confirmed,
      isOpen: false,
      notes: 'Reserva antes da aula experimental.',
      consumption: [],
    },
    {
      customerName: 'Sofia Queiroz',
      courtName: 'Beach Arena Sol',
      date: dayAfterTomorrow,
      startTime: '16:00',
      endTime: '17:00',
      status: ReservationStatus.Pending,
      isOpen: false,
      notes: 'Primeira reserva da cliente.',
      consumption: [],
    },
    {
      customerName: 'Thiago Barreto',
      courtName: 'Padel Atlântico',
      date: dayAfterTomorrow,
      startTime: '21:00',
      endTime: '22:00',
      status: ReservationStatus.Confirmed,
      isOpen: true,
      notes: 'Partida aberta para completar quarteto.',
      consumption: [
        { description: 'Bola oficial', quantity: 1, price: 35 },
      ],
    },
    {
      customerName: 'Helena Prado',
      courtName: 'Padel Dunas',
      date: addDays(today, -2),
      startTime: '19:00',
      endTime: '20:00',
      status: ReservationStatus.Confirmed,
      isOpen: false,
      notes: 'Cliente recorrente do horário noturno.',
      consumption: [
        { description: 'Água de coco', quantity: 2, price: 10 },
      ],
    },
    {
      customerName: 'Marina Albuquerque',
      courtName: 'Padel Atlântico',
      date: addDays(today, -6),
      startTime: '12:00',
      endTime: '13:00',
      status: ReservationStatus.Confirmed,
      isOpen: false,
      notes: 'Horário corporativo.',
      consumption: [],
    },
    {
      customerName: 'Caio Menezes',
      courtName: 'Beach Arena Mar',
      date: addDays(today, -9),
      startTime: '18:30',
      endTime: '19:30',
      status: ReservationStatus.Cancelled,
      isOpen: false,
      notes: 'Cancelada por chuva forte.',
      consumption: [],
    },
    {
      customerName: 'Pedro Valença',
      courtName: 'Society Farol',
      date: nextWeek,
      startTime: '20:00',
      endTime: '21:30',
      status: ReservationStatus.Confirmed,
      isOpen: false,
      notes: 'Jogo semanal do condomínio.',
      consumption: [
        { description: 'Taxa de iluminação premium', quantity: 1, price: 35 },
      ],
    },
  ] as const;

  for (const reservation of reservationsSeed) {
    const customer = customerByName[reservation.customerName];
    const court = courtByName[reservation.courtName];

    await prisma.reservation.create({
      data: {
        arenaId: arena.id,
        customerId: customer.id,
        courtId: court.id,
        sport: court.sport,
        date: atUtcMidnight(reservation.date),
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        amount: Number(court.pricePerHour),
        status: reservation.status,
        isOpen: reservation.isOpen,
        notes: reservation.notes,
        consumption: {
          create: reservation.consumption.map((item) => ({ ...item })),
        },
      },
    });
  }

  console.log(`${reservationsSeed.length} reservations created.`);

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

  await prisma.operatingHour.createMany({
    data: dayNames.map((day) => ({
      settingsId: settings.id,
      day,
      enabled: day !== 'Sunday',
      open: day === 'Saturday' ? '07:00' : '06:00',
      close: day === 'Saturday' ? '20:00' : '23:00',
    })),
  });

  await prisma.teamMember.createMany({
    data: [
      {
        arenaId: arena.id,
        name: 'Juliana Siqueira',
        email: 'juliana.siqueira@arenaatlantica.com.br',
        role: UserRole.Manager,
        status: 'Active',
      },
      {
        arenaId: arena.id,
        name: 'Carlos Henrique',
        email: 'carlos.henrique@arenaatlantica.com.br',
        role: UserRole.Reception,
        status: 'Active',
      },
    ],
  });

  const customerStats = await prisma.customer.findMany({
    where: { arenaId: arena.id },
    select: { id: true },
  });

  for (const customer of customerStats) {
    const reservations = await prisma.reservation.findMany({
      where: {
        customerId: customer.id,
        status: { not: ReservationStatus.Cancelled },
      },
      include: {
        consumption: true,
      },
    });

    const reservationsCount = reservations.length;
    const totalSpent = reservations.reduce((sum, reservation) => {
      const itemsTotal = reservation.consumption.reduce(
        (itemsSum, item) => itemsSum + Number(item.price) * item.quantity,
        0,
      );

      return sum + Number(reservation.amount) + itemsTotal;
    }, 0);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        reservationsCount,
        totalSpent,
      },
    });
  }

  console.log('Seed completed successfully.');
  console.log(`Login principal: ${adminUser.email} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
