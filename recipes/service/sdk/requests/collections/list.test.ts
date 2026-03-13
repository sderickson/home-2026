import { afterEach, describe, it, expect } from "vitest";
import { listCollectionsQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockCollections, resetMocks } from "./mocks.ts";

describe("listCollections", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns list of collections and members from fake handler", async () => {
    const [query, app] = withVueQuery(() => useQuery(listCollectionsQuery()));

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(query.data.value?.collections).toBeDefined();
    expect(Array.isArray(query.data.value?.collections)).toBe(true);
    expect(query.data.value?.collections).toHaveLength(mockCollections.length);
    expect(query.data.value?.collections?.[0]?.name).toBe(mockCollections[0].name);
    expect(query.data.value?.members).toBeDefined();
    expect(Array.isArray(query.data.value?.members)).toBe(true);

    app.unmount();
  });

  it("returns collections with expected shape (id, name, createdBy, createdAt, updatedAt)", async () => {
    const [query, app] = withVueQuery(() => useQuery(listCollectionsQuery()));

    await query.refetch();
    const collections = query.data.value?.collections;
    expect(collections?.length).toBeGreaterThan(0);
    expect(collections?.[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      createdBy: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    app.unmount();
  });
});
