FROM node:8.6
RUN mkdir -p /app
COPY . /app
WORKDIR /app
RUN npm install
