#!/bin/bash
# Push images to the container registry

if [ -z "$CONTAINER_REGISTRY" ]; then
  source ./deploy/env.remote
fi
echo "Container registry: $CONTAINER_REGISTRY"

docker push $CONTAINER_REGISTRY/sderickson-caddy:latest
# BEGIN WORKFLOW AREA push-images FOR product/init
docker push $CONTAINER_REGISTRY/sderickson-recipes-monolith:latest
docker push $CONTAINER_REGISTRY/sderickson-notebook-monolith:latest
docker push $CONTAINER_REGISTRY/sderickson-hub-monolith:latest
# END WORKFLOW AREA