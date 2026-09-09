# Two stages so the shipped image carries no compiler and no dev dependencies.
FROM node:22-slim AS build
WORKDIR /app

# Copied before the sources so a change to application code does not invalidate
# the dependency layer, which is the slow one.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
# Uses tsconfig.build.json, so tests stay out of dist.
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# --omit=dev drops vitest, supertest, tsx and typescript from the image.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Runs as an unprivileged user. The node image ships this account already.
USER node

# Cloud Run supplies PORT and the app reads it; this documents the default and
# makes `docker run -p 8080:8080` work locally without extra flags.
EXPOSE 8080
CMD ["node", "dist/index.js"]
