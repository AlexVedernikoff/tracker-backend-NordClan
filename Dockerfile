FROM node:8.6
RUN apt-get update
RUN apt-get install -y graphicsmagick
RUN mkdir -p /app
RUN npm install pm2 -g
COPY . /app
WORKDIR /app
RUN npm install
