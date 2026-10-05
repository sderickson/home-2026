#!/bin/bash
set -euo pipefail

# Builds the production images, skipping any whose inputs haven't changed
# since they were last built or pushed (see `saf-docker build`). Each static
# site is its own build under deploy/builds/, so changing one product only
# rebuilds that product's images (plus re-assembling caddy, which just copies
# the built sites in). Run from the repo root.
#
# Usage: build.sh [native|amd64] [extra saf-docker build args, e.g. --push]
#
# CI sets CONTAINER_REGISTRY; local dev uses deploy/env.remote
PLATFORM_MODE="${1:-amd64}"
shift || true

if [ -z "${CONTAINER_REGISTRY:-}" ]; then
  # shellcheck source=/dev/null
  source ./deploy/env.remote
fi
echo "Container registry: $CONTAINER_REGISTRY"

BUILDS=(
  # Caddy and the static sites it serves.
  --dir ./deploy
  # BEGIN WORKFLOW AREA deploy-builds FOR product/init
  @sderickson/hub-monolith
  # END WORKFLOW AREA
)

npm exec saf-docker -- build "${BUILDS[@]}" \
  --platform "$PLATFORM_MODE" \
  --registry "$CONTAINER_REGISTRY" \
  "$@"
