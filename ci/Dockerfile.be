FROM node:8.6

RUN apt-get update && \
    apt-get install -yq graphicsmagick && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app && \
    npm install pm2 -g

COPY . /app

WORKDIR /app

RUN npm install && npm rebuild

RUN mv ci/entrypoint.sh /entrypoint.sh && \
    chmod 755 /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pm2-runtime", "start", "processes.json"]
