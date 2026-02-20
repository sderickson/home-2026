// Shared mock data for recipes fake handlers.
//
// All fake handlers in this group (and perhaps other groups) should use the shared mock array from this
// file so that operations affect one another (e.g. create adds to the array,
// so subsequent list queries return the new resource).

import type { Recipe, RecipeVersion } from "@sderickson/recipes-spec";

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
    currentVersionId: "323e4567-e89b-12d3-a456-426614174003",
  },
];

export const mockRecipeVersions: RecipeVersion[] = [
  {
    id: "b2c3d4e5-e89b-12d3-a456-426614174002",
    recipeId: "123e4567-e89b-12d3-a456-426614174000",
    content: {
      ingredients: [
        { name: "All-purpose flour", quantity: "2", unit: "cups" },
        { name: "Butter", quantity: "1/2", unit: "cup" },
      ],
      instructionsMarkdown: "1. Preheat oven to 350°F.\n2. Mix dry ingredients.",
    },
    isLatest: true,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-01-15T14:30:00Z",
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174003",
    recipeId: "223e4567-e89b-12d3-a456-426614174001",
    content: {
      ingredients: [],
      instructionsMarkdown: "Toss and serve.",
    },
    isLatest: true,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-03-10T10:00:00Z",
  },
];
