import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import { recipeQueries } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import {
  createRecipeResultToCreateRecipeResponse,
  createWithVersionResultToCreateRecipeResponse,
} from "./_helpers.ts";

export const createRecipeHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const data: RecipesServiceRequestBody["createRecipe"] = req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const userId = auth.userId;

    const initialContent = data.initialVersion?.content;
    if (initialContent) {
      const { result, error } = await recipeQueries.createWithVersionRecipe(
        recipesDbKey,
        {
          title: data.title,
          shortDescription: data.shortDescription,
          longDescription: data.longDescription ?? null,
          isPublic: data.isPublic,
          createdBy: userId,
          updatedBy: userId,
          versionContent: {
            ingredients: initialContent.ingredients ?? [],
            instructionsMarkdown: initialContent.instructionsMarkdown ?? "",
          },
        },
      );

      if (error) {
        switch (true) {
          default:
            throw error satisfies never;
        }
      }

      const response: RecipesServiceResponseBody["createRecipe"][200] =
        createWithVersionResultToCreateRecipeResponse(
          result.recipe,
          result.version,
        );
      res.status(200).json(response);
      return;
    }

    const { result, error } = await recipeQueries.createRecipe(recipesDbKey, {
      title: data.title,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription ?? null,
      isPublic: data.isPublic,
      createdBy: userId,
      updatedBy: userId,
    });

    if (error) {
      switch (true) {
        default:
          throw error satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["createRecipe"][200] =
      createRecipeResultToCreateRecipeResponse(result);
    res.status(200).json(response);
  },
);
