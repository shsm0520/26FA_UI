# Jenkins deployment goal

This repo is prepared so Jenkins can deploy every root-level Svelte/Vite app under
its folder name.

## URL layout

- `/project1/` serves `project1/dist`
- `/hw2/` serves `hw2/dist`
- `/healthz` returns `ok` for smoke checks

The root `/` page lists links to the deployed apps.

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
2. `npm ci` and `npm run build` for every `*/package.json`
3. Build the nginx Docker image
4. Replace a local container on the Jenkins node
5. Smoke test `/healthz`, `/project1/`, and `/hw2/`

Do not commit private Jenkins scripts, SSH keys, server addresses, private repo
URLs, registry passwords, or `.env` files.


## Remote image deployment variables

`docker-compose.yml` supports Jenkins/Harbor deployment through environment
variables while still keeping local defaults:

```bash
FULL_IMAGE=reg.example.com/library/26fa-ui IMAGE_TAG=123 CONTAINER_NAME=26fa-ui APP_PORT=8080 docker compose up -d
```

This allows the private Jenkins Pipeline Script to build and push a tagged image,
then deploy the same image on the server without committing private registry or
SSH details to the repository.
