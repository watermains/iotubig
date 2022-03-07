# IoTubig Backend

![logo](logo.png)

[NestJS](https://nestjs.com/) Backend for IoTubig.

## Table of Contents

- [Dependencies](#dependencies)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Seed](#seed)
  - [Admin](#admin)
  - [Configuration](#configuration)
  - [Organization](#organization)
  - [Meter Consumption](#meter-consumption)
  - [Meter Data](#meter-data)
- [Running the app](#running-the-app)
- [Test](#test)
- [Docker](#docker)
- [Migrations](#migrations)

## Dependencies

- [Node.js v12](https://nodejs.org/download/release/latest-v12.x/)
- [Docker (optional)](https://docs.docker.com/get-docker/)

## Environment Variables

Sample values can be viewed on [.env.example](./.env.example)

| Variable                 | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `MONGO_URL`              | **Required**. DocumentDB/MongoDB URI.                |
| `JWT_SECRET`             | **Required**. JSON Web Token Secret Key.             |
| `JWT_EXPIRATION`         | **Required**. JSON Web Token Expiration.             |
| `IOT_URL`                | **Required**. AWS IoT Core API Gateway URL.          |
| `CUSTOMER_FRONT_END_URL` | **Required**. IoTubig Customer Frontend Base URL.    |
| `RESET_PASSWORD_PATH`    | **Required**. IoTubig Customer Reset Password route. |
| `MAIL_API_KEY`           | **Required**. AWS SES API KEY.                       |
| `REGION`                 | **Required**. AWS SES Region.                        |
| `SECRET`                 | **Required**. AWS SES Secret.                        |

## Installation

```bash
$ npm install
```

## Seed

Populate the ff. seeder files for:

### Admin

- [admin.json](./src/database/seeders/admin/admin.json)

### Configuration

- [configuration.json](./src/database/seeders/configuration/configuration.json)

### Organization

- [organization.json](./src/database/seeders/organization/organization.json)

```bash
# Run seeder script
$ npm run seed
```

### Meter Consumption

- [consumption.json](./src/database/seeders/consumption/consumption.json)

### Meter Data

- [meters.json](./src/database/seeders/consumption/meters.json)

```bash
# Run seeder script
$ npm run seed:dev
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docker

```bash
# Build Docker Container
$ docker compose build

# Run
$ docker compose up -d
```

## Migrations

Further information can be found [here](https://www.npmjs.com/package/migrate-mongoose).

```bash
# Lists all migrations and their current state
npm run migrate -- list

# Creates a new migration file
npm run migrate -- create <migration-name>

# Migrates all the migration files that have not yet
# been run in chronological order. Not including
# [migration-name] will run UP on all migrations that
# are in a DOWN state
npm run migrate -- up <migration-name>

# Rolls back all migrations down to given name (if down
# function was provided)
npm run migrate -- down <migration-name>

# Allows you to delete extraneous migrations by
# removing extraneous local migration files/database
# migrations
npm run migrate -- prune
```
