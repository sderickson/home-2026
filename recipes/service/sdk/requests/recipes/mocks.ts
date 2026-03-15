// Shared mock data for recipes fake handlers.
//
// All fake handlers in this group (and perhaps other groups) should use the shared mock array from this
// file so that operations affect one another (e.g. create adds to the array,
// so subsequent list queries return the new resource).
//
// Export resetMocks() so tests that mutate these arrays can restore initial state (e.g. in afterEach).

import type {
  Recipe,
  RecipeFileInfo,
  RecipeNoteFileInfo,
  RecipeVersion,
  RecipeNote,
} from "@sderickson/recipes-spec";

const TEST_COLLECTION_ID = "my-kitchen";

export const mockRecipes: (Recipe & { collectionId?: string })[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Classic Chocolate Chip Cookies",
    subtitle: "Crispy edges, chewy centers",
    description:
      "A crowd-pleasing recipe that works every time. Best with room-temperature butter.",
    collectionId: TEST_COLLECTION_ID,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-01-15T14:30:00Z",
    updatedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    updatedAt: "2023-02-01T09:00:00Z",
    currentVersionId: "b2c3d4e5-e89b-12d3-a456-426614174002",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    title: "Simple Salad",
    subtitle: "Quick and fresh",
    collectionId: TEST_COLLECTION_ID,
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
      instructionsMarkdown:
        "1. Preheat oven to 350°F.\n2. Mix dry ingredients.",
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

export const mockRecipeNotes: RecipeNote[] = [
  {
    id: "423e4567-e89b-12d3-a456-426614174001",
    recipeId: "123e4567-e89b-12d3-a456-426614174000",
    recipeVersionId: "b2c3d4e5-e89b-12d3-a456-426614174002",
    body: "Reduced sugar by 1/4 cup; next time try brown butter.",
    everEdited: false,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-01-20T11:00:00Z",
    updatedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    updatedAt: "2023-01-20T11:00:00Z",
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174002",
    recipeId: "123e4567-e89b-12d3-a456-426614174000",
    recipeVersionId: null,
    body: "Doubled the batch; cookies were perfect.",
    everEdited: true,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-02-05T14:00:00Z",
    updatedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    updatedAt: "2023-02-06T09:00:00Z",
  },
  {
    id: "623e4567-e89b-12d3-a456-426614174003",
    recipeId: "223e4567-e89b-12d3-a456-426614174001",
    recipeVersionId: null,
    body: "Added feta; worked well.",
    everEdited: false,
    createdBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    createdAt: "2023-03-12T12:00:00Z",
    updatedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    updatedAt: "2023-03-12T12:00:00Z",
  },
];

export const mockRecipeFiles: RecipeFileInfo[] = [
  {
    id: "713e4567-e89b-12d3-a456-426614174001",
    recipeId: "123e4567-e89b-12d3-a456-426614174000",
    blobName:
      "recipes/123e4567-e89b-12d3-a456-426614174000/713e4567-e89b-12d3-a456-426614174001.pdf",
    fileOriginalName: "grandmas-cookies.pdf",
    mimetype: "application/pdf",
    size: 102400,
    createdAt: "2023-01-16T10:00:00Z",
    updatedAt: "2023-01-16T10:00:00Z",
    uploadedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    downloadUrl:
      "https://storage.example.com/recipes/123e4567-e89b-12d3-a456-426614174000/713e4567-e89b-12d3-a456-426614174001.pdf",
  },
  {
    id: "723e4567-e89b-12d3-a456-426614174002",
    recipeId: "123e4567-e89b-12d3-a456-426614174000",
    blobName:
      "recipes/123e4567-e89b-12d3-a456-426614174000/723e4567-e89b-12d3-a456-426614174002.jpg",
    fileOriginalName: "cookies-photo.jpg",
    mimetype: "image/jpeg",
    size: 256000,
    createdAt: "2023-01-18T14:00:00Z",
    updatedAt: "2023-01-18T14:00:00Z",
    uploadedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    downloadUrl:
      "https://storage.example.com/recipes/123e4567-e89b-12d3-a456-426614174000/723e4567-e89b-12d3-a456-426614174002.jpg",
  },
  {
    id: "733e4567-e89b-12d3-a456-426614174003",
    recipeId: "223e4567-e89b-12d3-a456-426614174001",
    blobName:
      "recipes/223e4567-e89b-12d3-a456-426614174001/733e4567-e89b-12d3-a456-426614174003.pdf",
    fileOriginalName: "dressing-recipe.pdf",
    mimetype: "application/pdf",
    size: 15360,
    createdAt: "2023-03-11T09:00:00Z",
    updatedAt: "2023-03-11T09:00:00Z",
    uploadedBy: null,
    downloadUrl:
      "https://storage.example.com/recipes/223e4567-e89b-12d3-a456-426614174001/733e4567-e89b-12d3-a456-426614174003.pdf",
  },
];

export const mockRecipeNoteFiles: RecipeNoteFileInfo[] = [
  {
    id: "813e4567-e89b-12d3-a456-426614174001",
    recipeNoteId: "423e4567-e89b-12d3-a456-426614174001",
    blobName:
      "recipe-notes/423e4567-e89b-12d3-a456-426614174001/813e4567-e89b-12d3-a456-426614174001.pdf",
    fileOriginalName: "attempt-notes.pdf",
    mimetype: "application/pdf",
    size: 20480,
    createdAt: "2023-01-21T10:00:00Z",
    updatedAt: "2023-01-21T10:00:00Z",
    uploadedBy: "a1b2c3d4-e89b-12d3-a456-426614174001",
    downloadUrl:
      "https://api.recipes.example.com/recipes/123e4567-e89b-12d3-a456-426614174000/notes/423e4567-e89b-12d3-a456-426614174001/files/813e4567-e89b-12d3-a456-426614174001/blob",
  },
  {
    id: "823e4567-e89b-12d3-a456-426614174002",
    recipeNoteId: "523e4567-e89b-12d3-a456-426614174002",
    blobName:
      "recipe-notes/523e4567-e89b-12d3-a456-426614174002/823e4567-e89b-12d3-a456-426614174002.jpg",
    fileOriginalName: "cookies-batch.jpg",
    mimetype: "image/jpeg",
    size: 51200,
    createdAt: "2023-02-06T09:00:00Z",
    updatedAt: "2023-02-06T09:00:00Z",
    uploadedBy: null,
    downloadUrl:
      "https://api.recipes.example.com/recipes/123e4567-e89b-12d3-a456-426614174000/notes/523e4567-e89b-12d3-a456-426614174002/files/823e4567-e89b-12d3-a456-426614174002/blob",
  },
];

const initialMockRecipes = JSON.parse(JSON.stringify(mockRecipes)) as Recipe[];
const initialMockRecipeVersions = JSON.parse(
  JSON.stringify(mockRecipeVersions),
) as RecipeVersion[];
const initialMockRecipeNotes = JSON.parse(
  JSON.stringify(mockRecipeNotes),
) as RecipeNote[];
const initialMockRecipeFiles = JSON.parse(
  JSON.stringify(mockRecipeFiles),
) as RecipeFileInfo[];
const initialMockRecipeNoteFiles = JSON.parse(
  JSON.stringify(mockRecipeNoteFiles),
) as RecipeNoteFileInfo[];

/** Restore mock arrays to their initial state. Call from tests (e.g. afterEach) if they mutate the mocks. */
export function resetMocks(): void {
  mockRecipes.length = 0;
  mockRecipes.push(...JSON.parse(JSON.stringify(initialMockRecipes)));
  mockRecipeVersions.length = 0;
  mockRecipeVersions.push(
    ...JSON.parse(JSON.stringify(initialMockRecipeVersions)),
  );
  mockRecipeNotes.length = 0;
  mockRecipeNotes.push(...JSON.parse(JSON.stringify(initialMockRecipeNotes)));
  mockRecipeFiles.length = 0;
  mockRecipeFiles.push(
    ...JSON.parse(JSON.stringify(initialMockRecipeFiles)),
  );
  mockRecipeNoteFiles.length = 0;
  mockRecipeNoteFiles.push(
    ...JSON.parse(JSON.stringify(initialMockRecipeNoteFiles)),
  );
}
