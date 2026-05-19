FROM node:22-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY package.json ./
RUN npm install
COPY . .
RUN npx nest build

FROM node:22-alpine AS runner
RUN apk add --no-cache python3 make g++
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN npm install --omit=dev
RUN mkdir -p /app/uploads/images /app/uploads/videos /app/uploads/documents
EXPOSE 4000
CMD ["node", "dist/main.js"]
