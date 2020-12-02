FROM postgres
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin

ADD schema.sql /docker-entrypoint-initdb.d/
