# Builds every root-level folder that contains package.json and serves each
# compiled Vite/Svelte dist folder at /<folder-name>/ through nginx.
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .

RUN set -eux;     mkdir -p /site;     for package_file in */package.json; do       app="${package_file%/package.json}";       echo "Building ${app}";       npm ci --prefix "${app}";       npm run build --prefix "${app}";       mkdir -p "/site/${app}";       cp -r "${app}/dist/." "/site/${app}/";     done

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /site /usr/share/nginx/html
EXPOSE 80
