import { listByCollectionIdsCollectionMember } from "@sderickson/recipes-db/queries/collection-member/list-by-collection-ids";
import { listByEmailCollection } from "@sderickson/recipes-db/queries/collection/list-by-email";
import { listByCollectionIdMenu } from "@sderickson/recipes-db/queries/menu/list-by-collection-id";
import { MenuEntity } from "@sderickson/recipes-db/types";
import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";


import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { collectionsListResultToListCollectionsResponse } from "./_helpers.ts";

export const listCollectionsHandler = createHandler(async (_req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const email = auth.userEmail;
  if (!email) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }
  const emailValidated =
    (auth as { emailVerified?: boolean }).emailVerified !== false;

  const { result } = await listByEmailCollection(
    recipesDbKey,
    { email },
  );

  const rows = result ?? [];
  const visible = rows.filter((row) => row.isCreator || emailValidated);
  const collectionIds = visible.map((row) => row.id);

  const { result: memberRows } =
    await listByCollectionIdsCollectionMember(
      recipesDbKey,
      { collectionIds },
    );

  const members = memberRows ?? [];

  const allMenuRows: MenuEntity[] = [];
  for (const collectionId of collectionIds) {
    const { result: menuRows } = await listByCollectionIdMenu(
      recipesDbKey,
      { collectionId },
    );
    const list = menuRows ?? [];
    allMenuRows.push(...list);
  }

  const response: RecipesServiceResponseBody["listCollections"][200] =
    collectionsListResultToListCollectionsResponse(
      visible,
      members,
      allMenuRows,
    );

  res.status(200).json(response);
});
