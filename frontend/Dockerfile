FROM node:20-alpine

# Directory
WORKDIR /app

# Var setup
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Dependencies
COPY package*.json ./
RUN npm install

# Build
COPY . .
RUN npm run build

# Start Command
CMD npm run preview -- --host 0.0.0.0 --port 8080