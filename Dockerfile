FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

COPY web/package*.json ./
COPY web/prisma ./prisma

RUN npm install --no-audit

COPY web/ .

RUN npm run generate
RUN npm run build
RUN npm prune --production

FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat
RUN addgroup -S appgroup && adduser -S caprover-user -G appgroup

WORKDIR /usr/src/app

COPY --chown=caprover-user:appgroup --from=builder /usr/src/app ./

USER caprover-user

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "--import", "tsx", "server.js"]
