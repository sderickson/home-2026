#!/bin/bash
set -e

# CI sets CONTAINER_REGISTRY; local dev uses deploy/env.remote
if [ -z "$CONTAINER_REGISTRY" ]; then
  source ./deploy/env.remote
fi
echo "Container registry: $CONTAINER_REGISTRY"

# Print out git status
git status

# Generate git-hashes.json files that get COPY'd into images
npx saf-git-hashes

# Build dependent images

# Build static clients
# When adding a new static client, add the docker build command here, like so:
# docker build -f ./blog/Dockerfile . --platform linux/amd64 \
# 	-t (org name)-(product name)-client:latest \
# 	-t "$CONTAINER_REGISTRY/(org name)-(product name)-client:latest"
docker build -f ./blog/Dockerfile . --platform linux/amd64 \
	-t sderickson-blog-client:latest \
	-t "$CONTAINER_REGISTRY/sderickson-blog-client:latest"
docker build -f ./recipes/clients/static-root/Dockerfile . --platform linux/amd64 \
	-t sderickson-recipes-static-root:latest \
	-t "$CONTAINER_REGISTRY/sderickson-recipes-static-root:latest"

# BEGIN WORKFLOW AREA build-product-dependencies FOR product/init
docker build -f ./recipes/clients/build/Dockerfile . --platform linux/amd64 \
	-t sderickson-recipes-clients:latest

docker build -f ./hub/service/monolith/Dockerfile . --platform linux/amd64 \
	-t sderickson-hub-monolith:latest \
	-t "$CONTAINER_REGISTRY/sderickson-hub-monolith:latest"
docker build -f ./hub/clients/build/Dockerfile . --platform linux/amd64 \
	-t sderickson-hub-clients:latest

# END WORKFLOW AREA

# SPA client images (intermediate; bundled into caddy by deploy/Dockerfile.prod)

# Build reverse proxy image
docker build -f ./deploy/Dockerfile.prod . --platform linux/amd64 \
	-t sderickson-caddy:latest \
	-t "$CONTAINER_REGISTRY/sderickson-caddy:latest"

# Note: sometimes need to run with --no-cache if cache got into a weird state from cancelling mid-build