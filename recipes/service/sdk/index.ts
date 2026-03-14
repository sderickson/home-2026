// TODO: Export all Tanstack functions, Vue components, and other shared code used in production
// Since these packages can be large and shared, it's important to export everything independently,
// rather than grouping them in an object and exporting that object, so they can be properly tree-shaken.

export * from "./ingredient.ts";

// BEGIN SORTED WORKFLOW AREA query-group-exports FOR sdk/add-query sdk/add-mutation
export * from "./requests/collections/index.ts";
export * from "./requests/menus/index.ts";
export * from "./requests/recipes/index.ts";
export * from "./requests/unsplash-photos/index.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA component-exports FOR sdk/add-component
export { default as RecipeContentPreview } from "./components/recipe-content-preview/RecipeContentPreview.vue";
export { default as RecipeFilesDisplay } from "./components/recipe-files-display/RecipeFilesDisplay.vue";
export { default as RecipeList } from "./components/recipe-list/RecipeList.vue";
export { default as RecipePreview } from "./components/recipe-preview/RecipePreview.vue";
// END WORKFLOW AREA
