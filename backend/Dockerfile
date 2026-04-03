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

# Expose port
EXPOSE 3001

# Start command (will be overridden by docker-compose)
CMD ["sh", "-c", "echo 'DATABASE_URL:' $DATABASE_URL && echo 'Running migrations...' && npx prisma migrate deploy && echo 'Migrations done!' && node dist/src/main.js"]