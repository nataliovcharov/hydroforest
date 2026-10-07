# Dockerfile for HydroForest back-end
FROM node:22-alpine

WORKDIR /app

# Install production dependencies only, from the lock file
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=5005
EXPOSE 5005

CMD ["node", "app.js"]
