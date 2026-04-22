FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production
RUN npx prisma generate

COPY src ./src

RUN mkdir -p /app/data

ENV DATABASE_URL="file:/app/data/prod.db"
ENV PORT=3001

EXPOSE 3001

# Migrations + seed + start
CMD ["sh", "-c", "npx prisma migrate deploy && node src/seed.js && node src/index.js"]
