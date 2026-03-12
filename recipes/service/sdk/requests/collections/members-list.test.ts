import { afterEach, describe, it, expect } from "vitest";
import { membersListCollectionsQuery } from "./members-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockCollectionMembers, mockCollections, resetMocks } from "./mocks.ts";

describe("membersListCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns members for the given collection id", async () => {
    const id = mockCollections[0].id;
    const expectedMembers = mockCollectionMembers.filter(
      (m) => m.collectionId === id,
    );

    const [query, app] = withVueQuery(() =>
      useQuery(membersListCollectionsQuery(id)),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(query.data.value?.members).toBeDefined();
    expect(query.data.value?.members).toHaveLength(expectedMembers.length);
    expect(query.data.value?.members?.[0]?.email).toBe(expectedMembers[0].email);

    app.unmount();
  });
});
