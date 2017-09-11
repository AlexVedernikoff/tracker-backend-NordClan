FROM postgres:9.6
RUN mkdir -p /pg
WORKDIR /pg
COPY . /pg
ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD 123456
ENV POSTGRES_DB sim-track
COPY ./init.sh /docker-entrypoint-initdb.d/
RUN ["chmod", "+x", "/docker-entrypoint-initdb.d/init.sh"]
