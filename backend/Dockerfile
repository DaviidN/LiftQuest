FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start command (will be overridden by docker-compose)
CMD until npx prisma migrate deploy; do echo "DB not ready, retrying in 5s..."; sleep 5; done && node dist/src/main.js