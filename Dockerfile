FROM node:20 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY . .

# Install app dependencies
RUN npm install
RUN npm run build

FROM node:20

COPY --from=builder /app /app
WORKDIR /app
