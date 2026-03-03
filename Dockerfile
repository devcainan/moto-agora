# Dockerfile - Moto Agora Website
# Multi-stage build for optimized production image

# Stage 1: Build stage (if needed for future optimizations)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (if needed for build)
RUN npm ci --only=production

# Stage 2: Production stage with nginx
FROM nginx:alpine

# Metadata
LABEL maintainer="Moto Agora"
LABEL description="Website institucional de aluguel de motos - Moto Agora"
LABEL version="1.0.0"

# Install wget for health check
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy website files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY factor-2026.html /usr/share/nginx/html/
COPY factor-dx-2026.html /usr/share/nginx/html/
COPY honda-fan-160.html /usr/share/nginx/html/
COPY termos-e-privacidade.html /usr/share/nginx/html/

# Copy CSS (minified version)
COPY styles.min.css /usr/share/nginx/html/

# Copy JavaScript (minified versions)
COPY parallax.min.js /usr/share/nginx/html/
COPY viewer.min.js /usr/share/nginx/html/
COPY catalog.min.js /usr/share/nginx/html/
COPY formHandler.min.js /usr/share/nginx/html/

# Copy configuration files
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/
COPY _headers /usr/share/nginx/html/
COPY netlify.toml /usr/share/nginx/html/

# Copy images directory
COPY imagens/ /usr/share/nginx/html/imagens/

# Create cache directory and set permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
