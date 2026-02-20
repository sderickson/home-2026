// Shared mock data for recipes fake handlers.
//
// All fake handlers in this group (and perhaps other groups) should use the shared mock array from this
// file so that operations affect one another (e.g. create adds to the array,
// so subsequent list queries return the new resource).

import type { Recipe } from "@sderickson/recipes-spec";

export const mockRecipes: Recipe[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Classic Chocolate Chip Cookies",
    shortDescription: "Crispy edges, chewy centers",
    longDescription:
      "A crowd-pleasing recipe that works every time. Best with room-temperature butter.",
    isPublic: true,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-01-15T14:30:00Z",
    updatedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    updatedAt: "2023-02-01T09:00:00Z",
    currentVersionId: "b2c3d4e5-e89b-12d3-a456-426614174002",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    title: "Simple Salad",
    shortDescription: "Quick and fresh",
    isPublic: false,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-03-10T10:00:00Z",
    updatedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    updatedAt: "2023-03-10T10:00:00Z",
  },
];
