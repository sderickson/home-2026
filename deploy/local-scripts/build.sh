#!/bin/bash
set -e

source ./deploy/env.remote
echo "Container registry: $CONTAINER_REGISTRY"

# Bake git hashes into images (generated in repo root)
npx saf-git-hashes
set -a
# shellcheck source=/dev/null
source .env.git-hashes
set +a
echo "Git hashes: root=$GIT_HASH_ROOT saflib=$GIT_HASH_SAFLIB"

# Build dependent images
# BEGIN WORKFLOW AREA build-product-dependencies FOR product/init
docker build -t sderickson-recipes-clients:latest -f ./recipes/clients/build/Dockerfile . --platform linux/amd64

docker build -t $CONTAINER_REGISTRY/sderickson-recipes-monolith:latest -f ./recipes/service/monolith/Dockerfile . --platform linux/amd64 \
  --build-arg GIT_HASH_ROOT="$GIT_HASH_ROOT" --build-arg GIT_HASH_SAFLIB="$GIT_HASH_SAFLIB"

docker build -t sderickson-notebook-clients:latest -f ./notebook/clients/build/Dockerfile . --platform linux/amd64

docker build -t $CONTAINER_REGISTRY/sderickson-notebook-monolith:latest -f ./notebook/service/monolith/Dockerfile . --platform linux/amd64 \
  --build-arg GIT_HASH_ROOT="$GIT_HASH_ROOT" --build-arg GIT_HASH_SAFLIB="$GIT_HASH_SAFLIB"

docker build -t sderickson-hub-clients:latest -f ./hub/clients/build/Dockerfile . --platform linux/amd64

docker build -t $CONTAINER_REGISTRY/sderickson-hub-monolith:latest -f ./hub/service/monolith/Dockerfile . --platform linux/amd64 \
  --build-arg GIT_HASH_ROOT="$GIT_HASH_ROOT" --build-arg GIT_HASH_SAFLIB="$GIT_HASH_SAFLIB"

# END WORKFLOW AREA

# Build reverse proxy image (client assets built here with VITE_* from build-args)
docker build -t $CONTAINER_REGISTRY/sderickson-caddy:latest -f ./deploy/Dockerfile.prod . --platform linux/amd64 \
  --build-arg GIT_HASH_ROOT="$GIT_HASH_ROOT" --build-arg GIT_HASH_SAFLIB="$GIT_HASH_SAFLIB"

# Note: sometimes need to run with --no-cache if cache got into a weird state from cancelling mid-build