#!/bin/bash
set -e

source ./deploy/env.remote
echo "Container registry: $CONTAINER_REGISTRY"

# Generate git-hashes.json files that get COPY'd into images
npx saf-git-hashes

# Build dependent images

# BEGIN WORKFLOW AREA build-product-dependencies FOR product/init
docker build -t sderickson-blog-client:latest -f ./blog/Dockerfile . --platform linux/amd64
docker build -t sderickson-recipes-monolith:latest -f ./recipes/service/monolith/Dockerfile . --platform linux/amd64
docker build -t sderickson-notebook-monolith:latest -f ./notebook/service/monolith/Dockerfile . --platform linux/amd64
docker build -t sderickson-hub-monolith:latest -f ./hub/service/monolith/Dockerfile . --platform linux/amd64

# END WORKFLOW AREA

# Build reverse proxy image
docker build -t sderickson-caddy:latest -f ./deploy/Dockerfile.prod . --platform linux/amd64

# Note: sometimes need to run with --no-cache if cache got into a weird state from cancelling mid-build