# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL deps (including devDeps for tsc)
COPY package*.json ./
RUN npm install

# Copy source files
COPY tsconfig.json ./
COPY server ./server

# Compile TypeScript → JavaScript
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine

WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Run compiled JavaScript — no ts-node needed
CMD [ "node", "dist/index.js" ]