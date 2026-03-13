import { afterEach, describe, it, expect } from "vitest";
import { useUpdateCollectionsMutation } from "./update.ts";
import { getCollectionsQuery } from "./get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockCollections, resetMocks } from "./mocks.ts";

describe("updateCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the updated collection", async () => {
    const [mutation, app] = withVueQuery(() =>
      useUpdateCollectionsMutation(),
    );
    const id = mockCollections[0].id;

    const result = await mutation.mutateAsync({
      id,
      name: "Updated Kitchen",
    });

    expect(result).toBeDefined();
    expect(result.collection).toBeDefined();
    expect(result.collection.id).toBe(id);
    expect(result.collection.name).toBe("Updated Kitchen");
    expect(mockCollections[0].name).toBe("Updated Kitchen");

    app.unmount();
  });

  it("invalidates related queries so get-by-id reflects the update", async () => {
    const id = mockCollections[1].id;
    const [getQuery, app] = withVueQuery(() =>
      useQuery(getCollectionsQuery(id)),
    );
    const [mutation] = withVueQuery(() => useUpdateCollectionsMutation());

    await getQuery.refetch();
    expect(getQuery.data.value?.collection.name).toBe("Team Recipes");

    await mutation.mutateAsync({
      id,
      name: "Renamed Team Collection",
    });

    await getQuery.refetch();
    expect(getQuery.data.value?.collection.name).toBe("Renamed Team Collection");

    app.unmount();
  });
});
