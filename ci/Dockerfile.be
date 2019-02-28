FROM node:8.6 AS base
WORKDIR /tmp/build
RUN apt-get update && \
    apt-get install -yq graphicsmagick python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip3 install -r requirements.txt
RUN npm install pm2 -g

FROM base AS dependencies
WORKDIR /tmp/build
COPY package.json /tmp/build/package.json
RUN npm install

FROM base AS release
WORKDIR /app
COPY . /app
COPY --from=dependencies /tmp/build/node_modules ./node_modules
RUN npm rebuild
RUN mv ci/entrypoint.sh /entrypoint.sh && \
    chmod 755 /entrypoint.sh
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pm2-runtime", "start", "processes.json"]
