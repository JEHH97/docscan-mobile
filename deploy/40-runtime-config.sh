#!/bin/sh
set -eu

# Restrict the value to URL-safe characters so it can be embedded as a JSON string.
case "${API_URL:-}" in
    *[!A-Za-z0-9:/._-]*)
        echo "API_URL contains unsupported characters; use an HTTP(S) API origin." >&2
        exit 1
        ;;
esac
case "${API_URL:-}" in
    ""|http://*|https://*) ;;
    *)
        echo "API_URL must be empty or begin with http:// or https://." >&2
        exit 1
        ;;
esac

printf 'window.__DOCSCAN_CONFIG__={"apiUrl":"%s"};\n' "${API_URL:-}" \
    > /usr/share/nginx/html/config.js
