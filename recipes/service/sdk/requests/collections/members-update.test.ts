import { afterEach, describe, it, expect } from "vitest";
import { useMembersUpdateCollectionsMutation } from "./members-update.ts";
import { membersListCollectionsQuery } from "./members-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import {
  mockCollectionMembers,
  mockCollections,
  resetMocks,
} from "./mocks.ts";

describe("membersUpdateCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the updated member", async () => {
    const [mutation, app] = withVueQuery(() =>
      useMembersUpdateCollectionsMutation(),
    );
    const member = mockCollectionMembers.find(
      (m) => m.collectionId === "my-kitchen" && !m.isCreator,
    )!;
    const collectionId = mockCollections[0].id;

    const result = await mutation.mutateAsync({
      id: collectionId,
      memberId: member.id,
      role: "viewer",
    });

    expect(result).toBeDefined();
    expect(result.member).toBeDefined();
    expect(result.member.id).toBe(member.id);
    expect(result.member.role).toBe("viewer");
    expect(member.role).toBe("viewer");

    app.unmount();
  });

  it("invalidates related queries so members list reflects the updated role", async () => {
    const collectionId = "my-kitchen";
    const member = mockCollectionMembers.find(
      (m) => m.collectionId === collectionId && !m.isCreator,
    )!;
    const [listQuery, app] = withVueQuery(() =>
      useQuery(membersListCollectionsQuery(collectionId)),
    );
    const [mutation] = withVueQuery(() =>
      useMembersUpdateCollectionsMutation(),
    );

    await listQuery.refetch();
    expect(
      listQuery.data.value?.members?.find((m) => m.id === member.id)?.role,
    ).toBe("editor");

    await mutation.mutateAsync({
      id: collectionId,
      memberId: member.id,
      role: "viewer",
    });

    await listQuery.refetch();
    expect(
      listQuery.data.value?.members?.find((m) => m.id === member.id)?.role,
    ).toBe("viewer");

    app.unmount();
  });
});
