FROM node:8.6
RUN mkdir -p /app
RUN npm install pm2 -g
COPY . /app
WORKDIR /app
RUN npm install
CMD ["/app/wait-for.sh", "15", "pm2-docker", "start", "--auto-exit", "processes.json"]
