import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import { collectionQueries } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { createCollectionResultToCreateCollectionsResponse } from "./_helpers.ts";

export const createCollectionsHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const userEmail = auth.userEmail;
  if (!userEmail) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const data: RecipesServiceRequestBody["createCollections"] = req.body ?? {};
  const { result, error } = await collectionQueries.createCollection(
    recipesDbKey,
    {
      name: data.name,
      id: data.id,
      creatorEmail: userEmail,
    },
  );

  if (error) {
    switch (true) {
      default:
        throw error satisfies never;
    }
  }

  const response: RecipesServiceResponseBody["createCollections"][200] =
    createCollectionResultToCreateCollectionsResponse(result);
  res.status(200).json(response);
});
