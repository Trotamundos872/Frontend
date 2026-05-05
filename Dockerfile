
FROM node:20-alpine AS build
WORKDIR /app


COPY package*.json ./


RUN npm cache clean --force && \
    npm install --loglevel verbose

COPY . .

RUN npm run build


FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/dist/addonsmcenter ./dist/addonsmcenter
EXPOSE 4000
CMD ["node", "dist/addonsmcenter/server/server.mjs"]