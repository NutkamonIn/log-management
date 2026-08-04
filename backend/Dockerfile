FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build

# Expose HTTP API Port and Syslog UDP Port
EXPOSE 8000
EXPOSE 514/udp

# Start the application
CMD ["npm", "start"]
