FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=4173

WORKDIR /app

RUN apk add --no-cache su-exec

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json ./
COPY src ./src
COPY server ./server
COPY docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/data && chown -R node:node /app && chmod +x /app/docker-entrypoint.sh

EXPOSE 4173

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server/server.mjs"]
