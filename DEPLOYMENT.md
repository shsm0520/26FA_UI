# Jenkins deployment goal

This repo is prepared so Jenkins can deploy every root-level Svelte/Vite app under
its folder name.

## URL layout

- `/HW1b_ca1/` serves the static `HW1b_ca1/index.html` folder
- `/HW1b_ca2/` serves the static `HW1b_ca2/index.html` folder
- `/project1/` serves the built Svelte/Vite `project1/dist` folder
- `/hw2/` serves the built Svelte/Vite `hw2/dist` folder
- `/healthz` returns `ok` for smoke checks

The root `/` page is generated during the Docker build and lists every deployed top-level folder.

## Why `base: './'` is set

Each app is deployed below a subpath such as `/project1/`, not at the domain root.
Vite therefore needs relative asset paths. Each app's `vite.config.js` includes:

```js
base: './'
```

This keeps generated CSS/JS assets working from `/folder-name/`.

## Local deploy test

```bash
docker compose up --build -d
curl http://localhost:8080/healthz
curl http://localhost:8080/project1/
curl http://localhost:8080/hw2/
```

## Jenkins privacy policy

The real Jenkins pipeline is intentionally not committed as `Jenkinsfile`.

Reason: the live pipeline may include SSH deployment steps, private repository
references, registry endpoints, internal hostnames/IPs, and Jenkins credentials.
Those details should remain inside Jenkins as a private Pipeline Script or be
provided through Jenkins Credentials / job parameters.

This repository only keeps `Jenkinsfile.example`, which is a public-safe example
showing the intended build/deploy shape:

1. Checkout
2. Build the nginx Docker image with Compose
3. The Dockerfile runs `npm ci` and `npm run build` for every `*/package.json` inside `node:alpine`, and copies plain static folders that contain `index.html`
4. Deploy/update the service with `docker compose up -d`
5. Smoke test `/healthz`, `/project1/`, and `/hw2/`

Do not commit private Jenkins scripts, SSH keys, server addresses, private repo
URLs, registry passwords, or `.env` files.


## Remote image deployment variables

`docker-compose.yml` supports Jenkins/Harbor deployment through environment
variables while still keeping local defaults:

```bash
FULL_IMAGE=reg.example.com/library/26fa-ui \
IMAGE_TAG=123 \
CONTAINER_NAME=26fa-ui \
APP_PORT=8080 \
docker compose pull

FULL_IMAGE=reg.example.com/library/26fa-ui \
IMAGE_TAG=123 \
CONTAINER_NAME=26fa-ui \
APP_PORT=8080 \
docker compose up -d
```

This allows the private Jenkins Pipeline Script to build and push a tagged image,
then deploy the same image on the server without committing private registry or
SSH details to the repository.


## Compose-first deployment

The deployment path should use Compose (`docker compose pull/up`) rather than
`docker run`. Jenkins may build and push the image, but the deployment server
should update the service through the repo's `docker-compose.yml` so container
name, port mapping, restart policy, and future service settings stay in one
Compose file.


## Jenkins agent requirements

The Jenkins agent does not need local Node/npm for the default Compose image
pipeline. The repository `Dockerfile` uses a `node:22-alpine` builder stage and
runs each Svelte/Vite app build inside Docker.

Required on the Jenkins/deploy nodes for the Compose pipeline:

- `git`
- `docker`
- Docker Compose plugin (`docker compose`)
- `curl` for smoke tests

Install Node/npm on the Jenkins agent only if you intentionally keep a separate
pre-Docker verification stage that runs `npm ci` directly on the host.


## Smoke test readiness

After `docker compose up -d`, Jenkins should retry `/healthz` for a short period
instead of failing on the first request. Compose can report the container as
started before nginx is fully ready to accept the first connection.

If readiness still fails, check the deployment server with:

```bash
cd /opt/docker/26fa-ui
docker compose ps
docker logs 26fa-ui
curl -v http://localhost:8081/healthz
```


## Folder deployment behavior

During the Docker build, each top-level folder is handled as follows:

- If the folder has `package.json`, it is treated as a Svelte/Vite app. Jenkins
  does not need Node/npm on the host; the Dockerfile builds the app inside the
  `node:22-alpine` builder stage and copies its `dist` output to `/folder-name/`.
- If the folder has `index.html` but no `package.json`, it is treated as a plain
  static folder and copied directly to `/folder-name/`.
- Other folders are skipped.

This keeps old static homework folders such as `HW1b_ca1` and `HW1b_ca2`
accessible while still deploying Svelte folders as compiled Svelte/Vite output.
