
echo "Pulling latest docker images..."
docker pull $CONTAINER_REGISTRY/sderickson-caddy:latest
# BEGIN WORKFLOW AREA pull-images FOR product/init
docker pull $CONTAINER_REGISTRY/sderickson-recipes-monolith:latest
docker pull $CONTAINER_REGISTRY/sderickson-notebook-monolith:latest
# END WORKFLOW AREA
echo "Done!"