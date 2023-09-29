## Development

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

Start server without running crossbell event listeners:

```bash
DISABLE_CHAIN_EVENT_LISTENER=true npm run start:dev
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

## Migrate database

In development:

```bash
npm run prisma:migrate:dev
```

In production:

```bash
npm run prisma:migrate:deploy
```
