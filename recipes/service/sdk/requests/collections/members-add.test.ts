import { afterEach, describe, it, expect } from "vitest";
import { useMembersAddCollectionsMutation } from "./members-add.ts";
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

describe("membersAddCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the added member", async () => {
    const [mutation, app] = withVueQuery(() =>
      useMembersAddCollectionsMutation(),
    );

    const result = await mutation.mutateAsync({
      id: mockCollections[0].id,
      email: "new@example.com",
      role: "viewer",
    });

    expect(result).toBeDefined();
    expect(result.member).toBeDefined();
    expect(result.member.email).toBe("new@example.com");
    expect(result.member.role).toBe("viewer");
    expect(result.member.collectionId).toBe(mockCollections[0].id);
    expect(
      mockCollectionMembers.some((m) => m.id === result.member.id),
    ).toBe(true);

    app.unmount();
  });

  it("invalidates related queries so members list reflects the new member", async () => {
    const collectionId = mockCollections[0].id;
    const [listQuery, app] = withVueQuery(() =>
      useQuery(membersListCollectionsQuery(collectionId)),
    );
    const [mutation] = withVueQuery(() =>
      useMembersAddCollectionsMutation(),
    );

    await listQuery.refetch();
    const countBefore = listQuery.data.value?.members?.length ?? 0;

    await mutation.mutateAsync({
      id: collectionId,
      email: "cache-test@example.com",
      role: "editor",
    });

    await listQuery.refetch();
    const countAfter = listQuery.data.value?.members?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(
      listQuery.data.value?.members?.some(
        (m) => m.email === "cache-test@example.com",
      ),
    ).toBe(true);

    app.unmount();
  });
});
