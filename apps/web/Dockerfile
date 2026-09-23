FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace @final-capstone/web
COPY apps/web apps/web
RUN npm run build --workspace @final-capstone/web

FROM nginx:1.29-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html/app
COPY --from=build /app/apps/web/public/landing.html /usr/share/nginx/html/landing/landing.html
COPY --from=build /app/apps/web/public/landing/landing.css /usr/share/nginx/html/landing/landing.css
EXPOSE 80
