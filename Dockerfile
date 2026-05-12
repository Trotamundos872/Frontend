# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Instalar herramientas necesarias para Angular build
RUN apk add --no-cache bash git python3 make g++

# Copy package files first for caching
COPY package*.json ./

# Install dependencies ignoring peer conflicts
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --loglevel verbose

# Copy the rest of the app
COPY . .

# Asegurarnos de que Angular CLI es ejecutable
RUN chmod +x ./node_modules/.bin/ng

# Build Angular app
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Copy built app
COPY --from=build /app/dist/addonsmcenter ./dist/addonsmcenter

# Expose port
EXPOSE 4000

# Run server
CMD ["node", "dist/addonsmcenter/server/server.mjs"]
