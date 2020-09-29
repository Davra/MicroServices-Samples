FROM node:8
#NOTE: Do not use node:8-alpine here, incompatible with rdkafka

RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python

RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

COPY . /microservice
WORKDIR /microservice

RUN npm install

CMD ["sh", "start.sh"]
