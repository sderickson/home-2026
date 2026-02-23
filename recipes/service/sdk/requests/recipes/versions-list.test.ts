import { afterEach, describe, it, expect } from "vitest";
import { listRecipeVersionsQuery } from "./versions-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, mockRecipeVersions, resetMocks } from "./mocks.ts";

describe("listRecipeVersions", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns version list for recipe id", async () => {
    const id = mockRecipes[0].id;
    const [query, app] = withVueQuery(() =>
      useQuery(listRecipeVersionsQuery(id)),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(Array.isArray(query.data.value)).toBe(true);
    const versions = mockRecipeVersions.filter((v) => v.recipeId === id);
    expect(query.data.value).toHaveLength(versions.length);
    expect(query.data.value?.[0]?.recipeId).toBe(id);

    app.unmount();
  });

  it("returns versions with expected shape (recipeId, content)", async () => {
    const id = mockRecipes[1].id;
    const [query, app] = withVueQuery(() =>
      useQuery(listRecipeVersionsQuery(id)),
    );

    await query.refetch();
    const data = query.data.value;
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    if ((data?.length ?? 0) > 0) {
      expect(data?.[0]).toMatchObject({
        recipeId: id,
        id: expect.any(String),
        content: expect.any(Object),
      });
    }

    app.unmount();
  });
});
