# Deploy the public web demo to Vercel

The public site is a static Expo Router web export. Its default build has no API URL and opens in sample mode; it does not need an API server or a secret.

## 1. Import the repository

In Vercel, choose **Add New → Project**, import this repository, then set the project fields:

| Vercel field                                          | Value                                   |
| ----------------------------------------------------- | --------------------------------------- |
| **Project Name**                                      | `docscan-mobile` or your preferred name |
| **Framework Preset**                                  | `Other`                                 |
| **Root Directory**                                    | `./` (repository root)                  |
| **Build and Development Settings → Build Command**    | `npm run export:web`                    |
| **Build and Development Settings → Output Directory** | `dist`                                  |
| **Build and Development Settings → Install Command**  | `npm ci`                                |

The checked-in `vercel.json` carries the build command, output directory, and SPA fallback rewrites. Keep **Override** disabled for those settings unless you enter the same values. No API route or serverless function is needed.

## 2. Configure environment variables

For the coming-soon sample-mode demo, add **no environment variables** and **no secrets**. In particular, leave `EXPO_PUBLIC_API_URL` unset; an empty URL keeps the sample scan flow enabled.

To make a public web deployment call a separately deployed, public API, add this **Environment Variable** for the target environments:

| Name                  | Value                               |
| --------------------- | ----------------------------------- |
| `EXPO_PUBLIC_API_URL` | `https://<your-api-space>.hf.space` |

Then add the exact Vercel production origin (for example `https://docscan-mobile.vercel.app`) to that API's `CORS_ORIGINS` setting and redeploy both projects. The sample flow remains the safe default until this URL is set.

**Do not configure `EXPO_PUBLIC_API_KEY` for the public site.** Every `EXPO_PUBLIC_*` value is compiled into JavaScript downloaded by every visitor and is not a secret. The public API demo is designed to run without an API key. The app's Settings screen can be used for a separately managed local/test service when appropriate.

## 3. Deploy and verify

Click **Deploy** and wait for the build to complete. Confirm the Vercel deployment summary shows the `dist` output. Open the production URL and verify:

1. The scan screen renders and its sample-mode flow can be completed without an API request.
2. The history page loads directly at `/history` and after a browser refresh.
3. Expo Router deep paths such as `/processing/sample-check` and `/result/sample-check` return the app shell rather than a Vercel 404. (The sample IDs need not contain an actual saved scan.)
4. Browser developer tools show no failed app-shell or JavaScript asset requests.

To reproduce the static build and check its deep-route fallback locally, use Node.js 24 and run from the repository root:

```bash
npm ci
npm run export:web
npm run verify:export
```

The export is static. Vercel may rebuild it automatically when the connected branch changes; no separate server process is required.
