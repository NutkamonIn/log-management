FROM node:20-alpine

RUN apk add --no-cache curl jq bash

WORKDIR /app

# Copy ingest script requirements
COPY ./ingest/package*.json ./ingest/
RUN cd ingest && npm install

# Copy all ingest files
COPY ./ingest ./ingest/

# Copy tests files for bruteforce simulation
COPY ./tests ./tests/

# Copy the init script
COPY ./init/init.sh ./init.sh
RUN chmod +x ./init.sh

CMD ["./init.sh"]
