# Crossbell Newbie Villa Backend Service

Newbie Villa facilitates a smooth transition from Web2 to Web3 on Crossbell. Users can start by registering with their email, automatically receiving a Character for on-chain social interactions. As users delve deeper, they can claim their Characters via a wallet address, unlocking the broader Web3 social realm on Crossbell.

## Features

- Seamless Web3 migration with familiar email authentication.
- Automatic Character assignment for new registrations.
- On-chain social interactions recorded, with server covering initial gas fees.
- Progress to a genuine Web3 social user by claiming your Character with a wallet address.

## Getting Started

Install deps:

```bash
npm i
```

### Database

Start DB docker:

```bash
npm run docker:db
```

Migrate database and generate types in development environment:

```bash
npm run prisma:migrate:dev
```

Generate Prisma types only:

```bash
npm run prisma:generate
```

### Start server

Start server:

```bash
npm run start:dev
```

## Deployment

Docker:

```bash
# building new NestJS docker image
docker-compose build
# or
npm run docker:build

# start docker-compose
docker-compose up -d
# or
npm run docker
```

In Node.js Environment:

```
npm install
npm run build
./start_prod.sh
```

### Migrate database

In development:

```bash
npm run prisma:migrate:dev
```

In production:

```bash
npm run prisma:migrate:deploy
```

## Contribute

Feel free to contribute to the Newbie Villa service to help lower the barrier between Web2 and Web3!