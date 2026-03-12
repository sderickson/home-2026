// Shared mappers between database models and API response types.
import type { CollectionEntity } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";

type ListCollections200 =
  RecipesServiceResponseBody["listCollections"][200];

export function collectionToApiCollection(
  row: CollectionEntity,
): ListCollections200["collections"][number] {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function collectionsListResultToListCollectionsResponse(
  rows: CollectionEntity[],
): ListCollections200 {
  return {
    collections: rows.map(collectionToApiCollection),
  };
}

type CreateCollections200 =
  RecipesServiceResponseBody["createCollections"][200];

export function createCollectionResultToCreateCollectionsResponse(
  row: CollectionEntity,
): CreateCollections200 {
  return {
    collection: collectionToApiCollection(row),
  };
}