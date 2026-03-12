// Shared mappers between database models and API response types.
import type {
  CollectionEntity,
  CollectionMemberEntity,
} from "@sderickson/recipes-db";
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

type GetCollections200 =
  RecipesServiceResponseBody["getCollections"][200];

export function getCollectionResultToGetCollectionsResponse(
  row: CollectionEntity,
): GetCollections200 {
  return {
    collection: collectionToApiCollection(row),
  };
}

type UpdateCollections200 =
  RecipesServiceResponseBody["updateCollections"][200];

export function updateCollectionResultToUpdateCollectionsResponse(
  row: CollectionEntity,
): UpdateCollections200 {
  return {
    collection: collectionToApiCollection(row),
  };
}

/** No response body for 204; mapper used for consistency with other routes. */
export function deleteCollectionResultToDeleteCollectionsResponse(
  _row: CollectionEntity,
): void {
  // 204 No Content - no body to map
}

type MembersListCollections200 =
  RecipesServiceResponseBody["membersListCollections"][200];

export function collectionMemberToApiCollectionMember(
  row: CollectionMemberEntity,
): MembersListCollections200["members"][number] {
  return {
    id: row.id,
    collectionId: row.collectionId,
    email: row.email,
    role: row.role,
    isCreator: row.isCreator,
    createdAt: row.createdAt.toISOString(),
  };
}

export function membersListResultToMembersListCollectionsResponse(
  rows: CollectionMemberEntity[],
): MembersListCollections200 {
  return {
    members: rows.map(collectionMemberToApiCollectionMember),
  };
}

type MembersAddCollections200 =
  RecipesServiceResponseBody["membersAddCollections"][200];

export function addCollectionMemberResultToMembersAddCollectionsResponse(
  row: CollectionMemberEntity,
): MembersAddCollections200 {
  return {
    member: collectionMemberToApiCollectionMember(row),
  };
}

type MembersUpdateCollections200 =
  RecipesServiceResponseBody["membersUpdateCollections"][200];

export function updateRoleCollectionMemberResultToMembersUpdateCollectionsResponse(
  row: CollectionMemberEntity,
): MembersUpdateCollections200 {
  return {
    member: collectionMemberToApiCollectionMember(row),
  };
}