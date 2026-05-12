# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

ARG APP_PROTOCOL=http
ARG FRONTEND_HOST=localhost
ARG FRONTEND_PORT=4000
ARG BACKEND_HOST=localhost
ARG BACKEND_PORT=8080
ARG MEDIA_BASE_URL=https://www.trmc-addons.com/tfg-media

ENV APP_PROTOCOL=${APP_PROTOCOL}
ENV FRONTEND_HOST=${FRONTEND_HOST}
ENV FRONTEND_PORT=${FRONTEND_PORT}
ENV BACKEND_HOST=${BACKEND_HOST}
ENV BACKEND_PORT=${BACKEND_PORT}
ENV MEDIA_BASE_URL=${MEDIA_BASE_URL}

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

ARG FRONTEND_PORT=4000
ENV PORT=${FRONTEND_PORT}

# Copy built app
COPY --from=build /app/dist/addonsmcenter ./dist/addonsmcenter

# Expose port
EXPOSE ${FRONTEND_PORT}

# Run server
CMD ["node", "dist/addonsmcenter/server/server.mjs"]
