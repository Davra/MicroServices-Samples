FROM node:8
#NOTE: Do not use node:8-alpine here, incompatible with rdkafka

COPY . /microservice
WORKDIR /microservice

RUN npm install

CMD ["sh", "start.sh"]
