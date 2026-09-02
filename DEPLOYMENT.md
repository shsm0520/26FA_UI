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
Vite therefore needs relative asset paths.  Each app's `vite.config.js` includes:

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

## Jenkins flow

The included `Jenkinsfile` does:

1. Checkout
2. `npm ci` and `npm run build` for every `*/package.json`
3. Build the nginx Docker image
4. Replace the running container
5. Smoke test `/healthz`, `/project1/`, and `/hw2/`

No private URLs, credentials, or server-specific SSH keys are committed.
