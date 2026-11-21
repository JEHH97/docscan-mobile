FROM node:24.11.1-alpine3.21 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY app ./app
COPY src ./src
COPY public ./public
COPY app.json babel.config.js tsconfig.json ./
COPY scripts/inject-runtime-config.mjs ./scripts/inject-runtime-config.mjs
ARG EXPO_PUBLIC_API_URL=
RUN EXPO_PUBLIC_API_URL="$EXPO_PUBLIC_API_URL" npm run export:web \
    && node scripts/inject-runtime-config.mjs

FROM nginxinc/nginx-unprivileged:1.28.0-alpine3.21
USER root
RUN apk upgrade --no-cache
LABEL org.opencontainers.image.source="https://github.com/JEHH97/docscan-mobile" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.title="DocScan Mobile web demo" \
      org.opencontainers.image.description="Static DocScan Mobile web demo with runtime-configurable API endpoint"
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/security-headers.conf
COPY --chown=101:101 --from=build /app/dist/ /usr/share/nginx/html/
COPY --chown=101:101 --chmod=0555 deploy/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
ENV API_URL=""
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
RUN chown -R 101:101 /usr/share/nginx/html
USER 101:101
