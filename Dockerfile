# syntax=docker/dockerfile:1

# Echoes — production container.
# glibc base (bookworm-slim) is the safest host for the ffmpeg-static binary;
# Alpine/musl can fail to exec the prebuilt static ffmpeg.

# ---- deps ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone server output.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# ffmpeg-static is loaded by absolute path at runtime — copy it explicitly
# because the standalone tracer can miss the prebuilt binary.
COPY --from=builder /app/node_modules/ffmpeg-static ./node_modules/ffmpeg-static
RUN chmod +x ./node_modules/ffmpeg-static/ffmpeg || true

# Writable data dirs (overlaid by a persistent disk in production).
RUN mkdir -p ./data/audio ./data/uploads

EXPOSE 3000
CMD ["node", "server.js"]
