// Shared mock data for menus fake handlers.
//
// All fake handlers in this group (and perhaps other groups) should use the shared mock array from this
// file so that operations affect one another (e.g. create adds to the array,
// so subsequent list queries return the new resource).
//
// Export resetMocks() so tests that mutate this array can restore initial state (e.g. in afterEach).

import type { Menu } from "@sderickson/recipes-spec";

const TEST_COLLECTION_ID = "my-kitchen";

export const mockMenus: Menu[] = [
  {
    id: "K3m9_xR2",
    collectionId: TEST_COLLECTION_ID,
    name: "Weeknight Dinners",
    createdBy: "a1b2c3d4",
    createdAt: "2023-01-15T14:30:00Z",
    updatedBy: "a1b2c3d4",
    updatedAt: "2023-02-01T09:00:00Z",
    editedByUserIds: [],
    groupings: [
      { name: "Mains", recipeIds: ["123e4567-e89b-12d3-a456-426614174000"] },
      { name: "Sides", recipeIds: ["223e4567-e89b-12d3-a456-426614174001"] },
    ],
  },
  {
    id: "Pub1_abc",
    collectionId: TEST_COLLECTION_ID,
    name: "Public Brunch",
    createdBy: "a1b2c3d4",
    createdAt: "2023-03-01T10:00:00Z",
    updatedBy: "a1b2c3d4",
    updatedAt: "2023-03-01T10:00:00Z",
    editedByUserIds: [],
    groupings: [{ name: "Brunch", recipeIds: [] }],
  },
];

const initialMockMenus = JSON.parse(
  JSON.stringify(mockMenus),
) as Menu[];

/** Restore mock array to its initial state. Call from tests (e.g. afterEach) if they mutate the mocks. */
export function resetMocks(): void {
  mockMenus.length = 0;
  mockMenus.push(...JSON.parse(JSON.stringify(initialMockMenus)));
}
