# Multi-stage Dockerfile for the eBelge Tasarımcı backend.
#
# Stage 1 — build: install all deps (incl. devDependencies for any build step)
# Stage 2 — runtime: slim image, production-only deps, run as non-root
#
# Touched 2026-09-23 to force Railway snapshot re-upload (file hash change)

# Base image comes from the AWS mirror of the official Docker library;
# Railway builds hit Docker Hub's anonymous pull limit (429).

# ---------- Stage 1: deps ----------
FROM public.ecr.aws/docker/library/node:20-alpine AS deps
WORKDIR /app

# Install deps with npm ci for reproducible installs
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# ---------- Stage 2: runtime ----------
FROM public.ecr.aws/docker/library/node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3002 \
    HOST=0.0.0.0

# Bring node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Bring the source code
COPY . .

# Railway mounts a volume here for the SQLite database
# (set in the Railway dashboard: Mount Path = /data)
RUN mkdir -p /data && chown -R node:node /data

# Run as the non-root "node" user shipped with the alpine image
USER node

EXPOSE 3002

# Healthcheck — Railway also pings /api/health via railway.toml
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "server/index.js"]
