import { Pool } from 'pg';

// Ustaw DATABASE_URL
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/airline_reservation?schema=public';

// Utwórz połączenie PostgreSQL
const pool = new Pool({
  connectionString: databaseUrl,
});

const flights = [
  // Warszawa - Nowy Jork
  {
    flightNumber: 'LO001',
    origin: 'WAW',
    destination: 'JFK',
    departureTime: new Date('2024-12-20T08:00:00Z'),
    price: 2500.0,
    totalSeats: 180,
  },
  {
    flightNumber: 'LO002',
    origin: 'WAW',
    destination: 'JFK',
    departureTime: new Date('2024-12-21T14:30:00Z'),
    price: 2800.0,
    totalSeats: 200,
  },
  // Warszawa - Londyn
  {
    flightNumber: 'LO101',
    origin: 'WAW',
    destination: 'LHR',
    departureTime: new Date('2024-12-20T06:00:00Z'),
    price: 450.0,
    totalSeats: 150,
  },
  {
    flightNumber: 'LO102',
    origin: 'WAW',
    destination: 'LHR',
    departureTime: new Date('2024-12-20T18:00:00Z'),
    price: 500.0,
    totalSeats: 150,
  },
  {
    flightNumber: 'LO103',
    origin: 'WAW',
    destination: 'LHR',
    departureTime: new Date('2024-12-21T09:15:00Z'),
    price: 480.0,
    totalSeats: 150,
  },
  // Warszawa - Paryż
  {
    flightNumber: 'LO201',
    origin: 'WAW',
    destination: 'CDG',
    departureTime: new Date('2024-12-20T07:30:00Z'),
    price: 380.0,
    totalSeats: 120,
  },
  {
    flightNumber: 'LO202',
    origin: 'WAW',
    destination: 'CDG',
    departureTime: new Date('2024-12-21T16:45:00Z'),
    price: 420.0,
    totalSeats: 120,
  },
  // Warszawa - Berlin
  {
    flightNumber: 'LO301',
    origin: 'WAW',
    destination: 'BER',
    departureTime: new Date('2024-12-20T10:00:00Z'),
    price: 250.0,
    totalSeats: 100,
  },
  {
    flightNumber: 'LO302',
    origin: 'WAW',
    destination: 'BER',
    departureTime: new Date('2024-12-21T19:00:00Z'),
    price: 280.0,
    totalSeats: 100,
  },
  // Warszawa - Amsterdam
  {
    flightNumber: 'LO401',
    origin: 'WAW',
    destination: 'AMS',
    departureTime: new Date('2024-12-20T11:20:00Z'),
    price: 350.0,
    totalSeats: 130,
  },
  {
    flightNumber: 'LO402',
    origin: 'WAW',
    destination: 'AMS',
    departureTime: new Date('2024-12-21T20:30:00Z'),
    price: 380.0,
    totalSeats: 130,
  },
  // Warszawa - Frankfurt
  {
    flightNumber: 'LO501',
    origin: 'WAW',
    destination: 'FRA',
    departureTime: new Date('2024-12-20T12:00:00Z'),
    price: 320.0,
    totalSeats: 140,
  },
  {
    flightNumber: 'LO502',
    origin: 'WAW',
    destination: 'FRA',
    departureTime: new Date('2024-12-21T15:30:00Z'),
    price: 350.0,
    totalSeats: 140,
  },
  // Warszawa - Rzym
  {
    flightNumber: 'LO601',
    origin: 'WAW',
    destination: 'FCO',
    departureTime: new Date('2024-12-20T13:15:00Z'),
    price: 420.0,
    totalSeats: 160,
  },
  {
    flightNumber: 'LO602',
    origin: 'WAW',
    destination: 'FCO',
    departureTime: new Date('2024-12-21T22:00:00Z'),
    price: 450.0,
    totalSeats: 160,
  },
  // Warszawa - Barcelona
  {
    flightNumber: 'LO701',
    origin: 'WAW',
    destination: 'BCN',
    departureTime: new Date('2024-12-20T14:00:00Z'),
    price: 480.0,
    totalSeats: 180,
  },
  {
    flightNumber: 'LO702',
    origin: 'WAW',
    destination: 'BCN',
    departureTime: new Date('2024-12-21T08:30:00Z'),
    price: 520.0,
    totalSeats: 180,
  },
  // Warszawa - Madryt
  {
    flightNumber: 'LO801',
    origin: 'WAW',
    destination: 'MAD',
    departureTime: new Date('2024-12-20T09:00:00Z'),
    price: 550.0,
    totalSeats: 190,
  },
  {
    flightNumber: 'LO802',
    origin: 'WAW',
    destination: 'MAD',
    departureTime: new Date('2024-12-21T17:00:00Z'),
    price: 580.0,
    totalSeats: 190,
  },
  // Warszawa - Dubaj
  {
    flightNumber: 'LO901',
    origin: 'WAW',
    destination: 'DXB',
    departureTime: new Date('2024-12-20T22:00:00Z'),
    price: 3200.0,
    totalSeats: 220,
  },
  {
    flightNumber: 'LO902',
    origin: 'WAW',
    destination: 'DXB',
    departureTime: new Date('2024-12-22T23:30:00Z'),
    price: 3400.0,
    totalSeats: 220,
  },
  // Warszawa - Tokio
  {
    flightNumber: 'LO1001',
    origin: 'WAW',
    destination: 'NRT',
    departureTime: new Date('2024-12-21T10:00:00Z'),
    price: 4500.0,
    totalSeats: 240,
  },
  {
    flightNumber: 'LO1002',
    origin: 'WAW',
    destination: 'NRT',
    departureTime: new Date('2024-12-23T11:15:00Z'),
    price: 4800.0,
    totalSeats: 240,
  },
  // Powrotne loty
  // JFK - Warszawa
  {
    flightNumber: 'LO003',
    origin: 'JFK',
    destination: 'WAW',
    departureTime: new Date('2024-12-25T10:00:00Z'),
    price: 2600.0,
    totalSeats: 180,
  },
  {
    flightNumber: 'LO004',
    origin: 'JFK',
    destination: 'WAW',
    departureTime: new Date('2024-12-26T16:00:00Z'),
    price: 2900.0,
    totalSeats: 200,
  },
  // LHR - Warszawa
  {
    flightNumber: 'LO104',
    origin: 'LHR',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T08:00:00Z'),
    price: 460.0,
    totalSeats: 150,
  },
  {
    flightNumber: 'LO105',
    origin: 'LHR',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T20:00:00Z'),
    price: 510.0,
    totalSeats: 150,
  },
  // CDG - Warszawa
  {
    flightNumber: 'LO203',
    origin: 'CDG',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T09:00:00Z'),
    price: 390.0,
    totalSeats: 120,
  },
  {
    flightNumber: 'LO204',
    origin: 'CDG',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T18:30:00Z'),
    price: 430.0,
    totalSeats: 120,
  },
  // BER - Warszawa
  {
    flightNumber: 'LO303',
    origin: 'BER',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T11:30:00Z'),
    price: 260.0,
    totalSeats: 100,
  },
  {
    flightNumber: 'LO304',
    origin: 'BER',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T21:00:00Z'),
    price: 290.0,
    totalSeats: 100,
  },
  // AMS - Warszawa
  {
    flightNumber: 'LO403',
    origin: 'AMS',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T13:00:00Z'),
    price: 360.0,
    totalSeats: 130,
  },
  {
    flightNumber: 'LO404',
    origin: 'AMS',
    destination: 'WAW',
    departureTime: new Date('2024-12-23T07:00:00Z'),
    price: 390.0,
    totalSeats: 130,
  },
  // FRA - Warszawa
  {
    flightNumber: 'LO503',
    origin: 'FRA',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T14:15:00Z'),
    price: 330.0,
    totalSeats: 140,
  },
  {
    flightNumber: 'LO504',
    origin: 'FRA',
    destination: 'WAW',
    departureTime: new Date('2024-12-23T16:00:00Z'),
    price: 360.0,
    totalSeats: 140,
  },
  // FCO - Warszawa
  {
    flightNumber: 'LO603',
    origin: 'FCO',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T15:00:00Z'),
    price: 430.0,
    totalSeats: 160,
  },
  {
    flightNumber: 'LO604',
    origin: 'FCO',
    destination: 'WAW',
    departureTime: new Date('2024-12-23T10:30:00Z'),
    price: 460.0,
    totalSeats: 160,
  },
  // BCN - Warszawa
  {
    flightNumber: 'LO703',
    origin: 'BCN',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T16:45:00Z'),
    price: 490.0,
    totalSeats: 180,
  },
  {
    flightNumber: 'LO704',
    origin: 'BCN',
    destination: 'WAW',
    departureTime: new Date('2024-12-23T09:00:00Z'),
    price: 530.0,
    totalSeats: 180,
  },
  // MAD - Warszawa
  {
    flightNumber: 'LO803',
    origin: 'MAD',
    destination: 'WAW',
    departureTime: new Date('2024-12-22T12:00:00Z'),
    price: 560.0,
    totalSeats: 190,
  },
  {
    flightNumber: 'LO804',
    origin: 'MAD',
    destination: 'WAW',
    departureTime: new Date('2024-12-23T19:00:00Z'),
    price: 590.0,
    totalSeats: 190,
  },
  // DXB - Warszawa
  {
    flightNumber: 'LO903',
    origin: 'DXB',
    destination: 'WAW',
    departureTime: new Date('2024-12-24T02:00:00Z'),
    price: 3300.0,
    totalSeats: 220,
  },
  {
    flightNumber: 'LO904',
    origin: 'DXB',
    destination: 'WAW',
    departureTime: new Date('2024-12-25T03:30:00Z'),
    price: 3500.0,
    totalSeats: 220,
  },
  // NRT - Warszawa
  {
    flightNumber: 'LO1003',
    origin: 'NRT',
    destination: 'WAW',
    departureTime: new Date('2024-12-24T14:00:00Z'),
    price: 4600.0,
    totalSeats: 240,
  },
  {
    flightNumber: 'LO1004',
    origin: 'NRT',
    destination: 'WAW',
    departureTime: new Date('2024-12-26T15:30:00Z'),
    price: 4900.0,
    totalSeats: 240,
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  const client = await pool.connect();

  try {
    // Usuń wszystkie istniejące loty
    await client.query('DELETE FROM "Flight"');
    console.log('🗑️  Deleted all existing flights');

    // Dodaj przykładowe loty
    for (const flight of flights) {
      await client.query(
        `INSERT INTO "Flight" ("flightNumber", "origin", "destination", "departureTime", "price", "totalSeats")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          flight.flightNumber,
          flight.origin,
          flight.destination,
          flight.departureTime,
          flight.price.toString(),
          flight.totalSeats,
        ],
      );
    }

    console.log(`✅ Seeded ${flights.length} flights`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
