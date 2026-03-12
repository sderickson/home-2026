// Shared mock data for collections fake handlers.
//
// All fake handlers in this group (and perhaps other groups) should use the shared mock array from this
// file so that operations affect one another (e.g. create adds to the array,
// so subsequent list queries return the new resource).
//
// Export resetMocks() so tests that mutate this array can restore initial state (e.g. in afterEach).

import type { Collection, CollectionMember } from "@sderickson/recipes-spec";

export const mockCollections: Collection[] = [
  {
    id: "my-kitchen",
    name: "My Kitchen",
    createdBy: "K3m9_xR2",
    createdAt: "2023-01-15T14:30:00Z",
    updatedAt: "2023-02-01T09:00:00Z",
  },
  {
    id: "team-recipes",
    name: "Team Recipes",
    createdBy: "K3m9_xR2",
    createdAt: "2023-03-10T10:00:00Z",
    updatedAt: "2023-03-10T10:00:00Z",
  },
];

export const mockCollectionMembers: CollectionMember[] = [
  {
    id: "mem-my-kitchen-1",
    collectionId: "my-kitchen",
    email: "alice@example.com",
    role: "owner",
    isCreator: true,
    createdAt: "2023-01-15T14:30:00Z",
  },
  {
    id: "mem-my-kitchen-2",
    collectionId: "my-kitchen",
    email: "bob@example.com",
    role: "editor",
    isCreator: false,
    createdAt: "2023-01-20T10:00:00Z",
  },
  {
    id: "mem-team-1",
    collectionId: "team-recipes",
    email: "alice@example.com",
    role: "owner",
    isCreator: true,
    createdAt: "2023-03-10T10:00:00Z",
  },
];

const initialMockCollections = JSON.parse(
  JSON.stringify(mockCollections),
) as Collection[];

const initialMockCollectionMembers = JSON.parse(
  JSON.stringify(mockCollectionMembers),
) as CollectionMember[];

/** Restore mock array to its initial state. Call from tests (e.g. afterEach) if they mutate the mocks. */
export function resetMocks(): void {
  mockCollections.length = 0;
  mockCollections.push(...JSON.parse(JSON.stringify(initialMockCollections)));
  mockCollectionMembers.length = 0;
  mockCollectionMembers.push(
    ...JSON.parse(JSON.stringify(initialMockCollectionMembers)),
  );
}
