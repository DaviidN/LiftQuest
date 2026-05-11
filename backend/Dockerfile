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

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start command: generate client, wait for DB, apply migrations, start app
CMD npx prisma generate && until npx prisma migrate deploy; do echo "DB not ready, retrying in 5s..."; sleep 5; done && node dist/src/main.js