import { recipesHandler } from "../../typed-fake.ts";
import { nextDeterministicId } from "../deterministic-id.ts";
import { mockCollectionMembers } from "./mocks.ts";

export const membersAddCollectionsHandler = recipesHandler({
  verb: "post",
  path: "/collections/{id}/members",
  status: 200,
  handler: async ({ params, body }) => {
    const now = new Date().toISOString();
    const member = {
      id: nextDeterministicId("mem", mockCollectionMembers.length),
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
