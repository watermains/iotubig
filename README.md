# IoTubig Backend

![logo](logo.png)

[NestJS](https://nestjs.com/) Backend for IoTubig.

## Dependencies

- [Node.js v12](https://nodejs.org/download/release/latest-v12.x/)

## Environment Variables

Sample values can be viewed on [.env.example](./.env.example)

| Variable         | Description                                 |
| ---------------- | ------------------------------------------- |
| `MONGO_URL`      | **Required**. DocumentDB/MongoDB URI.       |
| `JWT_SECRET`     | **Required**. JSON Web Token Secret Key.    |
| `JWT_EXPIRATION` | **Required**. JSON Web Token Expiration.    |
| `IOT_URL`        | **Required**. AWS IoT Core API Gateway URL. |

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
