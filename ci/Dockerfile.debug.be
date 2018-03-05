FROM node:8.6
RUN apt-get update && apt-get install -yq graphicsmagick && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app
RUN npm install pm2 -g
COPY . /app
WORKDIR /app
RUN npm install && npm rebuild
CMD ["/app/wait-for.sh", "15", "pm2-docker", "start", "processes-debug.json"]
