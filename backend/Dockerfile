FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies needed for node-gyp and onnxruntime
RUN apt-get update && apt-get install -y python3 make g++ openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build

FROM node:20-slim

WORKDIR /app

# Ensure OpenSSL is available for Prisma runtime detection
RUN apt-get update && apt-get install -y openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src/prisma ./src/prisma

# Ensure uploads directory exists
RUN mkdir -p src/uploads

# Pre-download CLIP ONNX weights at build time
# This prevents cold-start delay on first classify request
RUN node -e " \
    const { pipeline, env } = require('@xenova/transformers'); \
    env.cacheDir = './models'; \
    pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32') \
    .then(() => { console.log('CLIP model cached'); process.exit(0); }) \
    .catch(e => { console.warn('Model pre-cache skipped:', e.message); process.exit(0); }); \
    "

EXPOSE 3000

# Start command
CMD ["npm", "run", "dev"]
