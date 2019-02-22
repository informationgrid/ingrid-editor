FROM openjdk:8-jre-alpine
MAINTAINER André Wallat <andre.wallat@wemove.com>
ENV TZ Europe/Berlin
ENV SERVER_PORT 80

RUN apk update
RUN apk add --no-cache tzdata

WORKDIR /app

ADD target/ige-ng-server-1.0.0-SNAPSHOT.jar src/main/resources/log4j2.xml /app/

EXPOSE 80
EXPOSE 8000

CMD java -jar ige-ng-server-1.0.0-SNAPSHOT.jar
