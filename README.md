# Crossbell Newbie Villa Backend Service

Newbie Villa facilitates a smooth transition from Web2 to Web3 on Crossbell. Users can start by registering with their email, automatically receiving a Character for on-chain social interactions. As users delve deeper, they can claim their Characters via a wallet address, unlocking the broader Web3 social realm on Crossbell.

## Features

- Seamless Web3 migration with familiar email authentication.
- Automatic Character assignment for new registrations.
- On-chain social interactions recorded, with server covering initial gas fees.
- Progress to a genuine Web3 social user by claiming your Character with a wallet address.

## Getting Started

#### Install deps:

```bash
npm install
```

#### Prepare environment variables:

```bash
copy .env.example .env
```

#### Setup wallet:

You will need to create a wallet and obtain the private key and address, then fill in the environment variables: `NEWBIE_VILLA_WALLET_ADDRESS` and `NEWBIE_VILLA_WALLET_PRIVATE_KEY`.

#### Setup mailer:

Follow [this article](https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1) to obtain the needed environment variables: `MAILER_GMAIL_CLIENT_ID`, `MAILER_GMAIL_CLIENT_SECRET`, `MAILER_GMAIL_REFRESH_TOKEN` and `MAILER_USER`.

#### Start Database instance:

```bash
npm run docker:db
```

#### Migrate database and generate types in development environment:

```bash
npm run prisma:migrate:dev
```

#### Start server:

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
NODE_ENV=production node dist/main
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

## Customizing Endpoints in [Crossbell React Kits](https://crossbell-dev.vercel.app)

Check out the customizing guide [here](https://crossbell-dev.vercel.app/docs/customizing-endpoints).

## Modules

### [NewbieJWT](src/module/newbie/newbie-jwt/)

NewbieJWT Module handles the account related features like login, register, reset password, delete account, etc.

### [NewbieTransaction](src/module/newbie/transaction/)

NewbieTransaction Module handles the transactions like posting, commenting, liking, tipping, etc.

### [Mailer](src/module/mailer/)

Mailer Module handles the email related features like sending verification email, sending reset password email, etc.

### [CsbManager](src/module/csb-manager/)

CsbManager Module provides some helper functions for interacting with the $CSB.

### [Contract](src/module/csb-manager/)

Contract Module used to initialize the contract instance.

## Contribute

Feel free to contribute to the Newbie Villa service to help lower the barrier between Web2 and Web3!

> 🫡 This project was initially developed by [@SongKeys](https://github.com/Songkeys). Original commit logs were deleted to protect sensitive information before open-sourcing.
