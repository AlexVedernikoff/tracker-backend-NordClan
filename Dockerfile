FROM node:10.16

RUN apt-get update && \
    apt-get install -yq graphicsmagick && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app && \
    npm install pm2 -g && pm2 update

WORKDIR /app
