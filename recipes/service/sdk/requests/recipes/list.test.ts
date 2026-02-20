import { describe, it, expect } from "vitest";
import { listRecipesQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes } from "./mocks.ts";

describe("listRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);

  it("returns list of recipes from fake handler", async () => {
    const [query, app] = withVueQuery(() => useQuery(listRecipesQuery()));

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(Array.isArray(query.data.value)).toBe(true);
    expect(query.data.value).toHaveLength(mockRecipes.length);
    expect(query.data.value?.[0]?.title).toBe(mockRecipes[0].title);

    app.unmount();
  });

  it("returns recipes with expected shape (id, title, isPublic)", async () => {
    const [query, app] = withVueQuery(() => useQuery(listRecipesQuery()));

    await query.refetch();
    const data = query.data.value;
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      isPublic: expect.any(Boolean),
    });

    app.unmount();
  });
});
