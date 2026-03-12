import { afterEach, describe, it, expect } from "vitest";
import { computed } from "vue";
import { useMembersManagementFlow } from "./useMembersManagementFlow.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { withVueQuery } from "@saflib/sdk/testing";
import {
  recipesServiceFakeHandlers,
  mockCollectionMembers,
  mockCollections,
  resetMocks,
} from "@sderickson/recipes-sdk/fakes";

describe("useMembersManagementFlow", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("add member: handleAddMember adds to mock and clears email", async () => {
    const collectionId = mockCollections[0].id;
    const [flow, app] = withVueQuery(() =>
      useMembersManagementFlow(
        computed(() => collectionId),
        computed(() => true),
      ),
    );

    const countBefore = mockCollectionMembers.filter(
      (m) => m.collectionId === collectionId,
    ).length;

    flow.newMemberEmail.value = "newuser@example.com";
    flow.newMemberRole.value = "viewer";
    await flow.handleAddMember();

    expect(
      mockCollectionMembers.filter((m) => m.collectionId === collectionId),
    ).toHaveLength(countBefore + 1);
    expect(
      mockCollectionMembers.some(
        (m) => m.collectionId === collectionId && m.email === "newuser@example.com",
      ),
    ).toBe(true);
    expect(flow.newMemberEmail.value).toBe("");

    app.unmount();
  });

  it("change role: handleChangeRole updates member in mock", async () => {
    const collectionId = "my-kitchen";
    const member = mockCollectionMembers.find(
      (m) => m.collectionId === collectionId && !m.isCreator,
    )!;
    const [flow, app] = withVueQuery(() =>
      useMembersManagementFlow(
        computed(() => collectionId),
        computed(() => true),
      ),
    );

    flow.handleChangeRole(member.id, "viewer");

    await new Promise((r) => setTimeout(r, 0));
    expect(member.role).toBe("viewer");

    app.unmount();
  });

  it("remove member: handleRemoveMember removes from mock", async () => {
    const collectionId = mockCollections[0].id;
    const member = mockCollectionMembers.find(
      (m) => m.collectionId === collectionId && !m.isCreator,
    )!;
    const memberId = member.id;
    const countBefore = mockCollectionMembers.length;

    const [flow, app] = withVueQuery(() =>
      useMembersManagementFlow(
        computed(() => collectionId),
        computed(() => true),
      ),
    );

    flow.handleRemoveMember(memberId);

    await new Promise((r) => setTimeout(r, 0));
    expect(mockCollectionMembers).toHaveLength(countBefore - 1);
    expect(mockCollectionMembers.some((m) => m.id === memberId)).toBe(false);

    app.unmount();
  });
});
