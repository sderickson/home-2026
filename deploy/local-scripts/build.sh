#!/bin/bash
set -e

source ./deploy/env.remote
echo "Container registry: $CONTAINER_REGISTRY"

# Build dependent images
# BEGIN WORKFLOW AREA build-product-dependencies FOR product/init
docker build -t sderickson-recipes-clients:latest -f ./recipes/clients/build/Dockerfile . --platform linux/amd64
docker build -t $CONTAINER_REGISTRY/sderickson-recipes-monolith:latest -f ./recipes/service/monolith/Dockerfile . --platform linux/amd64

docker build -t sderickson-notebook-clients:latest -f ./notebook/clients/build/Dockerfile . --platform linux/amd64
docker build -t $CONTAINER_REGISTRY/sderickson-notebook-monolith:latest -f ./notebook/service/monolith/Dockerfile . --platform linux/amd64

# END WORKFLOW AREA

# Build reverse proxy image
docker build -t $CONTAINER_REGISTRY/sderickson-caddy:latest -f ./deploy/Dockerfile.prod . --platform linux/amd64

# Note: sometimes need to run with --no-cache if cache got into a weird state from cancelling mid-build