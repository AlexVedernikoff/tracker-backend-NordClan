FROM node:8.6
RUN apt-get update && apt-get install -qyy graphicsmagick && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app
RUN npm install pm2 -g
COPY . /app
WORKDIR /app
RUN npm install
