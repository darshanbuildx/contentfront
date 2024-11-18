# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install

# Copy source files
COPY . .

# Set environment variables for build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js .
COPY --from=builder /app/package*.json .

# Install production dependencies only
RUN npm install --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start the server
CMD ["node", "server.js"]
