#!/bin/bash
set -e

source ./deploy/env.remote
echo "Container registry: $CONTAINER_REGISTRY"

# Generate git-hashes.json files that get COPY'd into images
npx saf-git-hashes

# Build dependent images

# BEGIN WORKFLOW AREA build-product-dependencies FOR product/init
docker build -f ./blog/Dockerfile . --platform linux/amd64 \
	-t sderickson-blog-client:latest \
	-t "$CONTAINER_REGISTRY/sderickson-blog-client:latest"
docker build -f ./recipes/service/monolith/Dockerfile . --platform linux/amd64 \
	-t sderickson-recipes-monolith:latest \
	-t "$CONTAINER_REGISTRY/sderickson-recipes-monolith:latest"
docker build -f ./notebook/service/monolith/Dockerfile . --platform linux/amd64 \
	-t sderickson-notebook-monolith:latest \
	-t "$CONTAINER_REGISTRY/sderickson-notebook-monolith:latest"
docker build -f ./hub/service/monolith/Dockerfile . --platform linux/amd64 \
	-t sderickson-hub-monolith:latest \
	-t "$CONTAINER_REGISTRY/sderickson-hub-monolith:latest"

# END WORKFLOW AREA

# Build reverse proxy image
docker build -f ./deploy/Dockerfile.prod . --platform linux/amd64 \
	-t sderickson-caddy:latest \
	-t "$CONTAINER_REGISTRY/sderickson-caddy:latest"

# Note: sometimes need to run with --no-cache if cache got into a weird state from cancelling mid-build