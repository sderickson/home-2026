import { afterEach, describe, it, expect } from "vitest";
import { useCreateCollectionsMutation } from "./create.ts";
import { listCollectionsQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockCollections, resetMocks } from "./mocks.ts";

describe("createCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the created collection", async () => {
    const [mutation, app] = withVueQuery(() =>
      useCreateCollectionsMutation(),
    );

    const result = await mutation.mutateAsync({
      name: "New Collection",
      id: "new-collection",
    });

    expect(result).toBeDefined();
    expect(result.collection).toBeDefined();
    expect(result.collection.name).toBe("New Collection");
    expect(result.collection.id).toBe("new-collection");
    expect(mockCollections.some((c) => c.id === result.collection.id)).toBe(
      true,
    );

    app.unmount();
  });

  it("invalidates related queries so list reflects the new collection", async () => {
    const [listQuery, app] = withVueQuery(() =>
      useQuery(listCollectionsQuery()),
    );
    const [mutation] = withVueQuery(() => useCreateCollectionsMutation());

    await listQuery.refetch();
    const countBefore = listQuery.data.value?.collections?.length ?? 0;

    await mutation.mutateAsync({
      name: "Cache Test Collection",
      id: "cache-test-collection",
    });

    await listQuery.refetch();
    const countAfter = listQuery.data.value?.collections?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(
      listQuery.data.value?.collections?.some(
        (c) => c.name === "Cache Test Collection",
      ),
    ).toBe(true);

    app.unmount();
  });
});
