import type { components, operations } from "./dist/openapi.d.ts";

export type { paths } from "./dist/openapi.d.ts";
import {
  type ExtractResponseBody,
  type ExtractRequestBody,
  castJson,
} from "@saflib/openapi";

export type RecipesServiceResponseBody =
  ExtractResponseBody<operations>;
export type RecipesServiceRequestBody = ExtractRequestBody<operations>;

export type Error = components["schemas"]["Error"];
export type ProductEvent = components["schemas"]["ProductEvent"];

// BEGIN SORTED WORKFLOW AREA schema-exports FOR openapi/add-schema
export type AddRecipeFileFromUnsplashRequest = components["schemas"]["AddRecipeFileFromUnsplashRequest"];
export type Collection = components["schemas"]["Collection"];
export type CollectionMember = components["schemas"]["CollectionMember"];
export type Menu = components["schemas"]["Menu"];
export type Recipe = components["schemas"]["Recipe"];
export type RecipeFileInfo = components["schemas"]["RecipeFileInfo"];
export type RecipeNote = components["schemas"]["RecipeNote"];
export type RecipeNoteFileInfo = components["schemas"]["RecipeNoteFileInfo"];
export type RecipeVersion = components["schemas"]["RecipeVersion"];
export type UnsplashAttribution = components["schemas"]["UnsplashAttribution"];
export type UnsplashPhotoSearchItem = components["schemas"]["UnsplashPhotoSearchItem"];
// END WORKFLOW AREA

import * as json from "./dist/openapi.json" with { type: "json" };

/**
 * For validating Express requests and responses.
 */
export const jsonSpec = castJson(json);
