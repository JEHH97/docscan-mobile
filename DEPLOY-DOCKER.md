# Deploy the public Docker demos

The two-image public demo is distributed through GitHub Container Registry:

- `ghcr.io/jehh97/docscan-api:latest` (plus `vX.Y.Z` and `sha-<short>` tags) runs the API, RQ worker, and private Redis together from the API repository's `Dockerfile.spaces`.
- `ghcr.io/jehh97/docscan-mobile-web:latest` (plus `vX.Y.Z` and `sha-<short>` tags) serves this repository's static Expo export through unprivileged nginx.

Version tags are created for `v*.*.*` releases, `latest` is created for release tags and manual publication from `main`, and both are built for `linux/amd64`.

## Run both images

Copy the Compose environment example, set the exact public origins, then start the services:

```sh
cp deploy/.env.example .env
docker compose --env-file .env -f deploy/docker-compose.prod.yml pull
docker compose --env-file .env -f deploy/docker-compose.prod.yml up -d
```

Compose publishes API port `7860` and web port `8080` for a reverse proxy. Terminate TLS at the proxy, route the web hostname to port `8080`, and route the API hostname to port `7860`. The API's Redis is private to its container and is not published. Set `API_URL` to the HTTPS API origin, and set the API's `CORS_ORIGINS` to the exact HTTPS web origin, with no trailing slash. Leave `WEBHOOKS_ENABLED=false` for the public demo.

The API has demo limits (`MAX_UPLOAD_BYTES=5242880`, `RATE_LIMIT_PER_MINUTE=10`, `RESULT_TTL_SECONDS=3600`), temporary storage, and no required API key. `API_KEY` may be set for a protected API, but a key must never be embedded in the public web app. By default, the API is publicly accessible without `API_KEY`; **do not upload sensitive documents**. Temporary scan data may be removed on restart or expiry.

### Runtime API configuration

The web image starts in sample mode when `API_URL` is empty. Set `API_URL` in the Compose environment to configure the API at container startup; the entrypoint writes a public `config.js` consumed by the app before it starts. This is preferred to rebuilding the image. As an alternative, build with `--build-arg EXPO_PUBLIC_API_URL=https://api.example.com`; this value is compiled into the downloaded bundle and is public. Do not pass secrets using `API_URL` or `EXPO_PUBLIC_*`.

## GHCR authentication

Public images do not require login. To pull a private package, use a GitHub PAT scoped with `read:packages`:

```sh
echo "$GHCR_READ_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Never copy the token into the repository or image build context.

## Health checks and verification

The API image probes `/healthz` on port `7860`. The web image exposes `/healthz` on `8080`; Compose also checks it. Verify the TLS endpoints after starting the stack:

```sh
curl --fail https://api.example.com/healthz
curl --fail https://docscan.example.com/ -o /dev/null
```

Open the website and refresh `/history` and `/result/sample-check` to verify its SPA fallback. If configured to call the API, verify the browser's API request and ensure `CORS_ORIGINS` contains the exact site origin.

The web image is built from a clean static export; the final nginx image runs non-root. No secrets, tests, local environment files, repository history, or photos are copied into the published image.
