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
# stage installs nothing. .next/static sits outside it and is copied
# separately, which is the step whose absence leaves a page with no CSS.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# There is no public/ directory: the favicon and fonts live under src/app and
# Next bundles them itself. A COPY of it fails the build rather than being
# skipped, so it is deliberately absent rather than forgotten.

USER node
EXPOSE 3000
CMD ["node", "server.js"]
