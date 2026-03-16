import { generateShortId } from "@saflib/utils";
import { identityServiceFakeConstants } from "@saflib/auth/fakes";
import { recipesHandler } from "../../typed-fake.ts";
import { mockCollections, mockCollectionMembers } from "./mocks.ts";

const defaultUser = identityServiceFakeConstants.defaultUser;

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
      createdBy: defaultUser.id,
      createdAt: now,
      updatedAt: now,
    };
    mockCollections.push(collection);
    mockCollectionMembers.push({
      id: `mem-${id}-owner`,
      collectionId: id,
      email: defaultUser.email,
      role: "owner",
      isCreator: true,
      createdAt: now,
    });
    return { collection };
  },
});
