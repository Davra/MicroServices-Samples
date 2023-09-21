FROM node:12-bullseye

RUN apt-get update && apt-get install -y python3
COPY . /microservice

WORKDIR /microservice
RUN npm install

CMD ["sh", "start.sh"]

