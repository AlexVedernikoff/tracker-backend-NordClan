FROM node:8.4
RUN mkdir -p /app
COPY . /app
WORKDIR /app
RUN npm install
