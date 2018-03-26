FROM node:8.6 AS base

RUN apt-get update && \
    apt-get install -yq graphicsmagick && \
    rm -rf /var/lib/apt/lists/*

RUN npm install pm2 -g

# get dependencies
FROM base AS dependencies

RUN mkdir -p /tmp/build

COPY package.json /tmp/build/package.json

WORKDIR /tmp/build

RUN npm install

# release image
FROM base AS release

RUN mkdir -p /app
WORKDIR /app

COPY . /app
COPY --from=dependencies /tmp/build/node_modules ./node_modules

RUN npm rebuild

RUN mv ci/entrypoint.sh /entrypoint.sh && \
    chmod 755 /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pm2-runtime", "start", "processes.json"]
