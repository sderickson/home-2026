#!/bin/sh
# Run before a product's prod-local (`npm run prod-local`), which brings up
# hub's stack, including the edge, under the product's own compose project.
# The edge has a fixed container name (sderickson-edge), so another project's
# edge container blocks it, even a stopped one. A stopped stack is taken down
# (its volumes are kept); a running one is left alone with a message.
#
# Usage: prod-local-claim-edge.sh <this stack's compose project>
set -eu
project="$1"
owner=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' sderickson-edge 2>/dev/null || true)
if [ -z "$owner" ] || [ "$owner" = "$project" ]; then
  exit 0
fi
if [ "$(docker inspect -f '{{.State.Running}}' sderickson-edge)" = true ]; then
  echo "The $owner stack is running and holds sderickson-edge. Stop it first:" >&2
  echo "  docker compose -p $owner down" >&2
  exit 1
fi
echo "Removing the stopped $owner stack (volumes are kept) to free sderickson-edge."
docker compose -p "$owner" down
