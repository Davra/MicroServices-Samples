FROM openjdk:11.0.13-jdk

COPY . /microservice

RUN curl -f -O -L https://downloads.davra.com/apache-maven-3.8.4-bin.tar.gz 

RUN tar -zxf apache-maven-3.8.4-bin.tar.gz -C /opt

WORKDIR /microservice
RUN /opt/apache-maven-3.8.4/bin/mvn package

CMD ["sh", "start.sh"]

