FROM nginx:1.27-alpine

RUN apk add --no-cache curl

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/www/certbot && \
    mkdir -p /etc/nginx/ssl && \
    mkdir -p /usr/share/nginx/html && \
    chown -R nginx:nginx /var/www/certbot /etc/nginx/ssl /usr/share/nginx/html /var/log/nginx

# Create a simple maintenance page
RUN echo '<!DOCTYPE html><html><head><title>Maintenance</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#f5f5f5;}h1{color:#333;}</style></head><body><h1>We\'ll be right back!</h1></body></html>' > /usr/share/nginx/html/maintenance.html

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD nginx -t && curl -f http://localhost/ || exit 1

EXPOSE 80 443

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
