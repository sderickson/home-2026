import { afterEach, describe, it, expect } from "vitest";
import { useDeleteCollectionsMutation } from "./delete.ts";
import { listCollectionsQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockCollections, resetMocks } from "./mocks.ts";

describe("deleteCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and removes collection from mock data", async () => {
    const [mutation, app] = withVueQuery(() =>
      useDeleteCollectionsMutation(),
    );
    const id = mockCollections[mockCollections.length - 1].id;
    const countBefore = mockCollections.length;

    await mutation.mutateAsync(id);

    expect(mockCollections).toHaveLength(countBefore - 1);
    expect(mockCollections.some((c) => c.id === id)).toBe(false);

    app.unmount();
  });

  it("invalidates related queries so list no longer includes deleted collection", async () => {
    const [listQuery, app] = withVueQuery(() =>
      useQuery(listCollectionsQuery()),
    );
    const [mutation] = withVueQuery(() => useDeleteCollectionsMutation());
    const id = mockCollections[mockCollections.length - 1].id;

    await listQuery.refetch();
    expect(
      listQuery.data.value?.collections?.some((c) => c.id === id),
    ).toBe(true);

    await mutation.mutateAsync(id);

    await listQuery.refetch();
    expect(
      listQuery.data.value?.collections?.some((c) => c.id === id),
    ).toBe(false);

    app.unmount();
  });
});
