FROM nginx:1.29-alpine

COPY apps/static-page/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/static-page/index.html /usr/share/nginx/html/index.html
COPY apps/static-page/styles.css /usr/share/nginx/html/styles.css
EXPOSE 80
