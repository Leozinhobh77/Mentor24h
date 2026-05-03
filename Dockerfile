# Multi-stage build para Node.js + Next.js (Railway)
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Build application
FROM base AS builder
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/twilio/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["npm", "start"]
