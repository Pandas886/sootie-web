#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://sootie.cloudeon.top}"

echo "[1/5] robots"
curl -fsSL "$BASE_URL/robots.txt" | sed -n '1,80p'

echo "\n[2/5] sitemap"
curl -fsSL "$BASE_URL/sitemap.xml" | sed -n '1,120p'

echo "\n[3/5] llms"
curl -fsSL "$BASE_URL/llms.txt" | sed -n '1,120p'

echo "\n[4/5] landing metadata"
curl -fsSL "$BASE_URL/landing" | rg -o '<title>.*</title>|<meta name="description"[^>]*>|application/ld\+json|og:title|twitter:card' -n | sed -n '1,80p'

echo "\n[5/5] guides metadata"
curl -fsSL "$BASE_URL/guides" | rg -o '<title>.*</title>|<meta name="description"[^>]*>|application/ld\+json|ItemList|BreadcrumbList' -n | sed -n '1,80p'

echo "\nSEO smoke check completed for: $BASE_URL"
