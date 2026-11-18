#!/usr/bin/env bash
# Rebuild the patched IPA: swaps in patch/H5Menu.html.
# Usage: patch/build.sh <original.ipa> [output.ipa]
set -euo pipefail
IN="$(realpath "$1")"
OUT="$(realpath -m "${2:-slither.io_2.0.2_fixed.ipa}")"
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cp "$IN" "$OUT"
APP="$(unzip -Z1 "$OUT" | grep -m1 -E '^Payload/[^/]+\.app/H5Menu\.html$')"
mkdir -p "$TMP/$(dirname "$APP")"
cp "$HERE/H5Menu.html" "$TMP/$APP"
(cd "$TMP" && zip -q "$OUT" "$APP")
unzip -tq "$OUT"
echo "Built $OUT — re-sign it before installing."
