FROM node:8.13

RUN apt-get update && \
    apt-get install -yq graphicsmagick && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app && \
    npm install pm2 -g

WORKDIR /app
