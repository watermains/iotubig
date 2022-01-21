FROM node:15.12.0-alpine3.10
RUN apk update --no-cache && \
    apk add bash autoconf automake gcc make g++ zlib-dev --no-cache

WORKDIR /usr/src/app

ADD . .

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "start" ]