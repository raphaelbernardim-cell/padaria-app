# Padaria App

Padaria App is a daily bakery sales registration system built to streamline order tracking, improve inventory visibility, and support a smoother customer checkout experience.

## Overview

The project currently includes:

- **Node.js/Express backend** for API endpoints and business logic.
- **PostgreSQL schema** for users, products, sales, inventory, and daily reports.
- **Environment-based configuration** for local development.
- **Planned React frontend** support referenced by the project scripts and original product outline.

## Features

- Daily sales registration.
- Product and inventory tracking.
- Daily reporting for total sales and inventory value.
- User account support with password hashing and JWT-based authentication dependencies.
- Stripe dependency included for payment integration work.

## Project Structure

```text
.
├── config/
│   ├── database.js
│   └── schema.sql
├── server/
│   └── package.json
├── .env.example
├── package.json
├── README.md
└── server.js
```

## Prerequisites

- Node.js 18+ recommended.
- PostgreSQL 14+ recommended.
- npm.

## Installation

1. Clone the repository.
2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and update the values for your machine:

   ```bash
   cp .env.example .env
   ```

4. Create a PostgreSQL database named `padaria_db` or update `DB_NAME` in `.env`.
5. Apply the schema:

   ```bash
   psql -U postgres -d padaria_db -f config/schema.sql
   ```

6. Start the API server:

   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` — starts the Express server.
- `npm run dev` — starts the server with `nodemon`.
- `npm run client` — starts the client app when a `client/` application is present.
- `npm run install-all` — installs root dependencies and then installs the client app dependencies when a `client/` application is present.

## API

### Health Check

- `GET /api/health`

Example response:

```json
{
  "status": "OK"
}
```

## Database Schema

The database schema is defined in `config/schema.sql` and contains the following tables:

- `users`
- `products`
- `sales`
- `inventory`
- `daily_reports`

## Environment Variables

The application expects the following variables in `.env`:

- `PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `JWT_SECRET`
- `STRIPE_API_KEY`
- `NODE_ENV`

## Notes

- The repository includes backend implementation and database setup files today.
- The original product brief also references a React frontend, but that application is not currently present in this repository.
