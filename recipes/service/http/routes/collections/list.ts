import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import type { MenuEntity } from "@sderickson/recipes-db";
import {
  collectionMemberQueries,
  collectionQueries,
  menuQueries,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { collectionsListResultToListCollectionsResponse } from "./_helpers.ts";

export const listCollectionsHandler = createHandler(async (_req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const email = auth.userEmail;
  const emailValidated =
    (auth as { emailVerified?: boolean }).emailVerified !== false;

  const { result } = await collectionQueries.listByEmailCollection(
    recipesDbKey,
    { email },
  );

  const rows = result ?? [];
  const visible = rows.filter((row) => row.isCreator || emailValidated);
  const collectionIds = visible.map((row) => row.id);

  const { result: memberRows } =
    await collectionMemberQueries.listByCollectionIdsCollectionMember(
      recipesDbKey,
      { collectionIds },
    );

  const members = memberRows ?? [];

  const allMenuRows: MenuEntity[] = [];
  for (const collectionId of collectionIds) {
    const { result: menuRows } = await menuQueries.listByCollectionIdMenu(
      recipesDbKey,
      { collectionId },
    );
    const member = members.find(
      (m) => m.collectionId === collectionId && m.email === email,
    );
    const role = member?.role ?? "viewer";
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
