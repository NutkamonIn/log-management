# Stage 1: Build React App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the frontend using Vite
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install OpenSSL for generating self-signed certificate
RUN apk add --no-cache openssl

# Generate self-signed certificate for SaaS mode (HTTPS)
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=TH/ST=Bangkok/L=Bangkok/O=InternDemo/OU=IT/CN=localhost"

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
