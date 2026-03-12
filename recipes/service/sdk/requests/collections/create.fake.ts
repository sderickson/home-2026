import { generateShortId } from "@saflib/utils";
import { recipesHandler } from "../../typed-fake.ts";
import { mockCollections } from "./mocks.ts";

const placeholderCreatedBy = "K3m9_xR2";

export const createCollectionsHandler = recipesHandler({
  verb: "post",
  path: "/collections",
  status: 200,
  handler: async ({ body }) => {
    const now = new Date().toISOString();
    const id = body.id ?? generateShortId();
    const collection = {
      id,
      name: body.name,
      createdBy: placeholderCreatedBy,
      createdAt: now,
      updatedAt: now,
    };
    mockCollections.push(collection);
    return { collection };
  },
});
