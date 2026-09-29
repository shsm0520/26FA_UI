# Builds every root-level Svelte/Vite folder that contains package.json and
# serves it at /<folder-name>/ through nginx.
#
# Root-level folders with a plain index.html and no package.json are copied as
# static folders, so existing assignments such as /HW1b_ca1/ and /HW1b_ca2/
# remain accessible too.
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .

RUN set -eux; \
    mkdir -p /site; \
    printf '%s\n' '<!doctype html><html><head><meta charset="utf-8"><title>26FA UI</title></head><body><h1>26FA UI</h1><ul>' > /site/index.html; \
    for dir in */; do \
      app="${dir%/}"; \
      if [ "$app" = "node_modules" ] || [ "$app" = "dist" ]; then \
        continue; \
      fi; \
      if [ -f "${app}/package.json" ]; then \
        echo "Building Svelte/Vite app: ${app}"; \
        npm ci --prefix "${app}"; \
        npm run build --prefix "${app}"; \
        mkdir -p "/site/${app}"; \
        cp -r "${app}/dist/." "/site/${app}/"; \
        printf '<li><a href="/%s/">%s</a> - Svelte/Vite</li>\n' "$app" "$app" >> /site/index.html; \
      elif [ -f "${app}/index.html" ]; then \
        echo "Copying static folder: ${app}"; \
        mkdir -p "/site/${app}"; \
        cp -r "${app}/." "/site/${app}/"; \
        printf '<li><a href="/%s/">%s</a> - static</li>\n' "$app" "$app" >> /site/index.html; \
      else \
        echo "Skipping folder without package.json or index.html: ${app}"; \
      fi; \
    done; \
    printf '%s\n' '</ul></body></html>' >> /site/index.html

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /site /usr/share/nginx/html
EXPOSE 80
