FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspace @final-capstone/api
COPY apps/api apps/api
RUN npm run build --workspace @final-capstone/api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci --omit=dev --workspace @final-capstone/api
COPY --from=build /app/apps/api/dist apps/api/dist
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
