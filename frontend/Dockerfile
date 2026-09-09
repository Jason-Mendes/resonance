FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# BACKEND_URL is read per request on the server, not inlined at build time, so
# it is deliberately absent here and supplied by Cloud Run instead.
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# The standalone output already contains the dependencies it needs, so this
# stage installs nothing. static/ and public/ sit outside it and are copied
# separately, which is the step whose absence leaves a page with no CSS.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "server.js"]
