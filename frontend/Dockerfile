# FROM node:20-alpine

# Set working directory
# WORKDIR /app

# Copy package files
# COPY package*.json ./

# Install dependencies
# RUN npm install

# Copy source code
# COPY . .

# Expose port
#EXPOSE 5173

# Start command (will be overridden by docker-compose)
# CMD ["npm", "run", "dev"]

FROM node:20-alpine

# Directory
WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install

# Build
COPY . .
RUN npm run build

# Start Command
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]