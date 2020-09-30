FROM node:8
#NOTE1: Do not use node:8-alpine here, incompatible with rdkafka-2.8.1 (segmentation faults)
#NOTE2: For later rdkafka (2.8.2+) you need node:8.10 (at least).   sure you explictly set the node-rdkafka version in package.json

COPY . /microservice
WORKDIR /microservice

RUN npm install

CMD ["sh", "start.sh"]
