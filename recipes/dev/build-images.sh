#!/bin/bash
set -euo pipefail

# Pre-build images in parallel before `docker compose up --build`.
DEV_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$DEV_DIR/../.." && pwd)"
cd "$REPO_ROOT"

DEV_SITE_DOCKERFILE="$(npm exec --prefix "$DEV_DIR" saf-dev-site-dockerfile)"

export DOCKER_BUILDKIT=1

docker_build() {
  local dockerfile=$1
  shift
  docker build -f "$dockerfile" . "$@"
}

wait_all() {
  local fail=0
  local pid
  for pid in "$@"; do
    if ! wait "$pid"; then
      fail=1
    fi
  done
  if [ "$fail" -ne 0 ]; then
    echo "One or more parallel docker builds failed." >&2
    exit 1
  fi
}

pids=()

docker_build ./recipes/clients/static-root/Dockerfile \
  -t sderickson-recipes-static-root:latest &
pids+=($!)

docker_build ./recipes/service/monolith/Dockerfile \
  -t sderickson-recipes-monolith:latest &
pids+=($!)

docker_build ./recipes/clients/build/Dockerfile \
  -t sderickson-recipes-clients:latest &
pids+=($!)

docker_build "$DEV_SITE_DOCKERFILE" \
  -t saflib-dev-site:latest &
pids+=($!)

wait_all "${pids[@]}"

# Caddy depends on static-root from phase 1.
docker_build ./recipes/dev/Dockerfile \
  -t sderickson-recipes-dev-caddy:latest
