import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import { recipeQueries } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "./_collection-auth.ts";
import {
  createRecipeResultToCreateRecipeResponse,
  createWithVersionResultToCreateRecipeResponse,
} from "./_helpers.ts";
import { assertNoHtml, sanitizeVersionContent } from "./_markdown.ts";

export const createRecipeHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const data: RecipesServiceRequestBody["createRecipe"] = req.body ?? {};
    const collectionId = data.collectionId;
    if (typeof collectionId !== "string" || !collectionId.trim()) {
      throw createError(400, "collectionId is required in request body", {
        code: "VALIDATION_ERROR",
      });
    }

    assertNoHtml({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
    });

    await requireCollectionMembership(collectionId.trim(), {
      requireMutate: true,
    });

    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const userId = auth.userId;

    const rawContent = data.initialVersion?.content;
    if (rawContent) {
      const { content, removedHtml } = sanitizeVersionContent({
        ingredients: rawContent.ingredients ?? [],
        instructionsMarkdown: rawContent.instructionsMarkdown ?? "",
      });
      const { result, error } = await recipeQueries.createWithVersionRecipe(
        recipesDbKey,
        {
          collectionId: collectionId.trim(),
          title: data.title,
          subtitle: data.subtitle,
          description: data.description ?? null,
          createdBy: userId,
          updatedBy: userId,
          versionContent: content,
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
          removedHtml,
        );
      res.status(200).json(response);
      return;
    }

    const { result, error } = await recipeQueries.createRecipe(recipesDbKey, {
      collectionId: collectionId.trim(),
      title: data.title,
      subtitle: data.subtitle,
      description: data.description ?? null,
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
