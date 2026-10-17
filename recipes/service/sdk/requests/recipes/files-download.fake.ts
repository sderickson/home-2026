import { recipesHandler } from "../../typed-fake.ts";

export const filesDownloadRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/files/{fileId}/blob",
  status: 200,
  handler: async () =>
    new Blob(["mock file bytes"], {
      type: "application/octet-stream",
    }) as unknown as undefined,
});
