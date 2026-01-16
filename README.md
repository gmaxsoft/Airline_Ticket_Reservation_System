# Airline Ticket Reservation System

A modern, scalable backend system for airline ticket reservations built with Nest.js, Prisma ORM, and PostgreSQL.

## 🚀 Tech Stack

- **[Nest.js](https://nestjs.com/)** - Progressive Node.js framework for building efficient server-side applications
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js and TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Open-source relational database
- **[Docker](https://www.docker.com/)** - Containerization platform for PostgreSQL
- **[TypeScript](https://www.typescriptlang.org/)** - Typed superset of JavaScript
- **[JWT](https://jwt.io/)** - JSON Web Tokens for authentication
- **[Passport](http://www.passportjs.org/)** - Authentication middleware for Node.js
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.x or higher
- npm or yarn
- Docker and Docker Compose

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/gmaxsoft/Airline_Ticket_Reservation_System.git
cd Airline_Ticket_Reservation_System
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/airline_reservation?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=airline_reservation
POSTGRES_PORT=5432
JWT_SECRET="your-secret-key-here-change-in-production"
```

## 🐳 Database Setup

Start PostgreSQL using Docker Compose:

```bash
npm run docker:up
```

This will start a PostgreSQL container with the following default configuration:
- **User:** postgres
- **Password:** postgres
- **Database:** airline_reservation
- **Port:** 5432

To stop the database:
```bash
npm run docker:down
```

To view database logs:
```bash
npm run docker:logs
```

## 🗄️ Database Migrations

After setting up the database, generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Seed the database with sample data (48 users and 45 flights)
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Sample Data

The seed script creates:
- **48 sample users** with hashed passwords (default password: `password123`)
- **45 sample flights** with various destinations

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected endpoints require a valid JWT token in the `Authorization` header.

### Login

To obtain a JWT token, login using the `/auth/login` endpoint:

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe"
  }
}
```

### Using the Token

Include the token in the `Authorization` header for protected endpoints:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token expiration:** 1 day

### Protected Endpoints

All booking endpoints require authentication. Unauthenticated requests will receive a `401 Unauthorized` response.

## 📡 API Endpoints

### Authentication

#### POST `/auth/login`
Login and obtain JWT token.

**Request:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 6 characters)"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "string",
  "user": {
    "id": "number",
    "email": "string",
    "fullName": "string"
  }
}
```

**Error:** `401 Unauthorized` - Invalid credentials

---

### Users

#### POST `/users`
Create a new user.

**Request:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 6 characters)",
  "fullName": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "email": "string",
  "fullName": "string",
  "createdAt": "ISO 8601 date"
}
```

**Error:** `409 Conflict` - Email already exists

#### GET `/users`
Get all users (without passwords).

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "email": "string",
    "fullName": "string",
    "createdAt": "ISO 8601 date"
  }
]
```

#### GET `/users/:id`
Get user by ID.

**Response:** `200 OK`
```json
{
  "id": "number",
  "email": "string",
  "fullName": "string",
  "createdAt": "ISO 8601 date"
}
```

**Error:** `404 Not Found` - User not found

#### PATCH `/users/:id`
Update user.

**Request:**
```json
{
  "email": "string (optional)",
  "password": "string (optional, min 6 characters)",
  "fullName": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "email": "string",
  "fullName": "string",
  "createdAt": "ISO 8601 date"
}
```

**Errors:**
- `404 Not Found` - User not found
- `409 Conflict` - Email already taken

#### DELETE `/users/:id`
Delete user.

**Response:** `204 No Content`

**Error:** `404 Not Found` - User not found

---

### Flights

#### POST `/flights`
Create a new flight.

**Request:**
```json
{
  "flightNumber": "string (unique)",
  "origin": "string (e.g., WAW)",
  "destination": "string (e.g., JFK)",
  "departureTime": "ISO 8601 date",
  "price": "number (decimal)",
  "totalSeats": "number (integer)"
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "flightNumber": "string",
  "origin": "string",
  "destination": "string",
  "departureTime": "ISO 8601 date",
  "price": "number",
  "totalSeats": "number"
}
```

#### GET `/flights`
Get all flights (ordered by departure time).

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "flightNumber": "string",
    "origin": "string",
    "destination": "string",
    "departureTime": "ISO 8601 date",
    "price": "number",
    "totalSeats": "number"
  }
]
```

#### GET `/flights/:id`
Get flight by ID.

**Response:** `200 OK`
```json
{
  "id": "number",
  "flightNumber": "string",
  "origin": "string",
  "destination": "string",
  "departureTime": "ISO 8601 date",
  "price": "number",
  "totalSeats": "number"
}
```

**Error:** `404 Not Found` - Flight not found

#### PATCH `/flights/:id`
Update flight.

**Request:** (All fields optional)
```json
{
  "flightNumber": "string",
  "origin": "string",
  "destination": "string",
  "departureTime": "ISO 8601 date",
  "price": "number",
  "totalSeats": "number"
}
```

**Response:** `200 OK`

**Error:** `404 Not Found` - Flight not found

#### DELETE `/flights/:id`
Delete flight.

**Response:** `204 No Content`

**Error:** `404 Not Found` - Flight not found

---

### Bookings 🔒 (Protected - Requires JWT Token)

All booking endpoints require authentication. User ID is automatically extracted from JWT token.

#### POST `/bookings`
Create a new booking. Automatically uses user ID from JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "flightId": "number (integer, min 1)",
  "seatNumber": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "flightId": "number",
  "userId": "number",
  "seatNumber": "string",
  "status": "confirmed",
  "bookingDate": "ISO 8601 date",
  "flight": {
    "id": "number",
    "flightNumber": "string",
    "origin": "string",
    "destination": "string",
    "departureTime": "ISO 8601 date",
    "price": "number",
    "totalSeats": "number"
  },
  "user": {
    "id": "number",
    "email": "string",
    "fullName": "string",
    "createdAt": "ISO 8601 date"
  }
}
```

**Business Validation:**
- ✅ Checks if flight exists
- ✅ Checks if user exists
- ✅ Prevents overbooking (validates available seats)
- ✅ Prevents duplicate seat booking
- ✅ Prevents user from booking same flight twice

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Flight or user not found
- `400 Bad Request` - No available seats (overbooking)
- `400 Bad Request` - Seat already booked
- `400 Bad Request` - User already has booking for this flight

#### GET `/bookings`
Get all bookings (admin view).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "flightId": "number",
    "userId": "number",
    "seatNumber": "string",
    "status": "string",
    "bookingDate": "ISO 8601 date",
    "flight": { ... },
    "user": { ... }
  }
]
```

#### GET `/bookings/my` ⭐
Get logged-in user's bookings.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "flightId": "number",
    "userId": "number",
    "seatNumber": "string",
    "status": "string",
    "bookingDate": "ISO 8601 date",
    "flight": {
      "id": "number",
      "flightNumber": "string",
      "origin": "string",
      "destination": "string",
      "departureTime": "ISO 8601 date",
      "price": "number",
      "totalSeats": "number"
    },
    "user": {
      "id": "number",
      "email": "string",
      "fullName": "string",
      "createdAt": "ISO 8601 date"
    }
  }
]
```

**Note:** Only returns bookings for the authenticated user (userId from JWT token).

#### GET `/bookings/:id`
Get booking by ID. Only owner can access their booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "flightId": "number",
  "userId": "number",
  "seatNumber": "string",
  "status": "string",
  "bookingDate": "ISO 8601 date",
  "flight": { ... },
  "user": { ... }
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Booking not found
- `403 Forbidden` - User does not have permission to access this booking

#### PATCH `/bookings/:id`
Update booking. Only owner can update their booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "seatNumber": "string (optional)",
  "status": "string (optional, 'confirmed' or 'cancelled')"
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "flightId": "number",
  "userId": "number",
  "seatNumber": "string",
  "status": "string",
  "bookingDate": "ISO 8601 date",
  "flight": { ... },
  "user": { ... }
}
```

**Business Rules:**
- ✅ Can only cancel confirmed bookings
- ✅ Validates seat availability when changing seat number
- ✅ Prevents duplicate seat assignments

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Booking not found
- `403 Forbidden` - User does not own this booking
- `400 Bad Request` - Cannot cancel booking with status other than 'confirmed'
- `400 Bad Request` - New seat is already booked

#### DELETE `/bookings/:id`
Delete booking. Only owner can delete their booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Booking not found
- `403 Forbidden` - User does not own this booking

## 🏃 Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3000`.

## 💡 Usage Examples

### Complete Booking Flow

```bash
# 1. Login and get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": 1, "email": "john.doe@example.com", "fullName": "John Doe" }
# }

# 2. Get available flights
curl -X GET http://localhost:3000/flights

# 3. Create a booking
curl -X POST http://localhost:3000/bookings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": 1,
    "seatNumber": "12A"
  }'

# 4. Get my bookings
curl -X GET http://localhost:3000/bookings/my \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 5. Cancel a booking
curl -X PATCH http://localhost:3000/bookings/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }'
```

### Business Logic Examples

**Overbooking Protection:**
```bash
# If all seats are booked, you'll get:
# 400 Bad Request: "No available seats for flight LO001. All 200 seats are already booked."
```

**Duplicate Seat Prevention:**
```bash
# If seat is already booked:
# 400 Bad Request: "Seat 12A is already booked for this flight."
```

**Single Booking Per Flight:**
```bash
# If user already has booking for this flight:
# 400 Bad Request: "You already have a confirmed booking for this flight."
```

**Access Control:**
```bash
# If user tries to access another user's booking:
# 403 Forbidden: "You do not have permission to access this booking"
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Coverage

The project includes comprehensive unit tests for:
- **Users module** - 28 tests covering CRUD operations and security
- **Flights module** - Tests for all flight endpoints
- **Auth module** - 35 tests covering authentication, JWT generation, Guard, and Strategy
  - AuthService: 9 tests
  - AuthController: 7 tests
  - JwtStrategy: 12 tests
  - JwtAuthGuard: 7 tests
- **Bookings module** - 42 tests covering business logic, validation, and access control
  - BookingsService: 24 tests
  - BookingsController: 18 tests

**Total:** Over 100 unit tests covering all modules

## 📝 Available Scripts

### Application
- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:prod` - Start in production mode
- `npm run start:debug` - Start in debug mode

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:migrate:deploy` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:format` - Format Prisma schema
- `npm run prisma:seed` - Seed database with sample data

### Docker
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker logs

## 📂 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts   # JWT strategy for Passport
│   ├── jwt-auth.guard.ts # JWT authentication guard
│   └── dto/
│       └── login.dto.ts
├── users/                # Users module
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── flights/              # Flights module
│   ├── flights.controller.ts
│   ├── flights.service.ts
│   ├── flights.module.ts
│   └── dto/
│       ├── create-flight.dto.ts
│       └── update-flight.dto.ts
├── bookings/             # Bookings module (protected)
│   ├── bookings.controller.ts
│   ├── bookings.service.ts
│   ├── bookings.module.ts
│   └── dto/
│       ├── create-booking.dto.ts
│       └── update-booking.dto.ts
├── prisma/               # Prisma service
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── main.ts               # Application entry point
└── app.module.ts         # Root module

prisma/
├── schema.prisma         # Database schema
├── seed.ts               # Database seed script
├── migrations/           # Database migrations
└── config.ts             # Prisma configuration
```

## 🔒 Security Features

- **Password Hashing** - All passwords are hashed using bcrypt (10 salt rounds)
- **JWT Authentication** - Secure token-based authentication
- **JWT Guard** - Protected endpoints require valid JWT token
- **Access Control** - Users can only access/modify their own bookings
- **Input Validation** - All DTOs use class-validator for validation
- **Password Security** - Passwords are never returned in API responses
- **Business Logic Validation** - Prevents overbooking and duplicate bookings

## 🛠️ Development

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **GitHub Actions** for CI/CD
- **class-validator** for DTO validation
- **class-transformer** for data transformation

## 📚 Documentation

- [Nest.js Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

This project is private and proprietary.
