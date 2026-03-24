import { recipesHandler } from "../../typed-fake.ts";
import { mockDefaultUser } from "../identity-mock-constants.ts";
import { nextDeterministicId } from "../deterministic-id.ts";
import { mockCollections, mockCollectionMembers } from "./mocks.ts";

const defaultUser = mockDefaultUser;

export const createCollectionsHandler = recipesHandler({
  verb: "post",
  path: "/collections",
  status: 200,
  handler: async ({ body }) => {
    const now = new Date().toISOString();
    const id = body.id ?? nextDeterministicId("col", mockCollections.length);
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
