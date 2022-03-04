FROM node:12.19.0-alpine3.9 AS development

# RUN apk update --no-cache && \
#     apk add bash autoconf automake gcc make g++ zlib-dev --no-cache

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

RUN npm run build