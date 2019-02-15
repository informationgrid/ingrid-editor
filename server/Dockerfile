FROM openjdk:8-jre-alpine
MAINTAINER André Wallat <andre.wallat@wemove.com>

RUN apk update

WORKDIR /app

ADD target/ige-ng-server-1.0.0-SNAPSHOT.jar /app

EXPOSE 8550

CMD java -jar ige-ng-server-1.0.0-SNAPSHOT.jar
