import { recipesHandler } from "../../typed-fake.ts";

export const sharedFilesDownloadRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/shared/files/{fileId}/blob",
  status: 200,
  handler: async () =>
    new Blob(["mock shared file bytes"], {
      type: "application/octet-stream",
    }) as unknown as undefined,
});
