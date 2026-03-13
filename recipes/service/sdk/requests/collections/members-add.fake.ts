import { generateShortId } from "@saflib/utils";
import { recipesHandler } from "../../typed-fake.ts";
import { mockCollectionMembers } from "./mocks.ts";

export const membersAddCollectionsHandler = recipesHandler({
  verb: "post",
  path: "/collections/{id}/members",
  status: 200,
  handler: async ({ params, body }) => {
    const now = new Date().toISOString();
    const member = {
      id: generateShortId(),
      collectionId: params.id,
      email: body.email,
      role: body.role,
      isCreator: false,
      createdAt: now,
    };
    mockCollectionMembers.push(member);
    return { member };
  },
});
