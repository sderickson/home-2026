import { afterEach, describe, it, expect } from "vitest";
import { getCollectionsQuery } from "./get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockCollections, resetMocks } from "./mocks.ts";

describe("getCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns collection for known id", async () => {
    const id = mockCollections[0].id;
    const [query, app] = withVueQuery(() =>
      useQuery(getCollectionsQuery(id)),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(query.data.value?.collection).toBeDefined();
    expect(query.data.value?.collection.id).toBe(id);
    expect(query.data.value?.collection.name).toBe(mockCollections[0].name);

    app.unmount();
  });

  it("returns collection with expected shape (id, name, createdBy, createdAt, updatedAt)", async () => {
    const id = mockCollections[1].id;
    const [query, app] = withVueQuery(() =>
      useQuery(getCollectionsQuery(id)),
    );

    await query.refetch();
    const collection = query.data.value?.collection;
    expect(collection).toBeDefined();
    expect(collection).toMatchObject({
      id,
      name: expect.any(String),
      createdBy: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    app.unmount();
  });
});
