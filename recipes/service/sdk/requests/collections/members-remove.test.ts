import { afterEach, describe, it, expect } from "vitest";
import { useMembersRemoveCollectionsMutation } from "./members-remove.ts";
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

describe("membersRemoveCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and removes member from mock data", async () => {
    const [mutation, app] = withVueQuery(() =>
      useMembersRemoveCollectionsMutation(),
    );
    const member = mockCollectionMembers.find(
      (m) => m.collectionId === "my-kitchen" && !m.isCreator,
    )!;
    const countBefore = mockCollectionMembers.length;

    await mutation.mutateAsync({
      id: mockCollections[0].id,
      memberId: member.id,
    });

    expect(mockCollectionMembers).toHaveLength(countBefore - 1);
    expect(
      mockCollectionMembers.some(
        (m) => m.collectionId === "my-kitchen" && m.id === member.id,
      ),
    ).toBe(false);

    app.unmount();
  });

  it("invalidates related queries so members list no longer includes removed member", async () => {
    const collectionId = "my-kitchen";
    const member = mockCollectionMembers.find(
      (m) => m.collectionId === collectionId && !m.isCreator,
    )!;
    const [listQuery, app] = withVueQuery(() =>
      useQuery(membersListCollectionsQuery(collectionId)),
    );
    const [mutation] = withVueQuery(() =>
      useMembersRemoveCollectionsMutation(),
    );

    await listQuery.refetch();
    expect(
      listQuery.data.value?.members?.some((m) => m.id === member.id),
    ).toBe(true);

    await mutation.mutateAsync({
      id: collectionId,
      memberId: member.id,
    });

    await listQuery.refetch();
    expect(
      listQuery.data.value?.members?.some((m) => m.id === member.id),
    ).toBe(false);

    app.unmount();
  });
});
