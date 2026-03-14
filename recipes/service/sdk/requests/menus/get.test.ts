import { afterEach, describe, it, expect } from "vitest";
import { getMenuQuery } from "./get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockMenus, resetMocks } from "./mocks.ts";

describe("getMenu", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns menu and recipes from fake handler (works at all)", async () => {
    const menuId = mockMenus[0].id;
    const [query, app] = withVueQuery(() =>
      useQuery(getMenuQuery(menuId, "my-kitchen")),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(query.data.value?.menu).toBeDefined();
    expect(query.data.value?.recipes).toBeDefined();
    expect(query.data.value?.menu.id).toBe(menuId);
    expect(query.data.value?.menu.name).toBe(mockMenus[0].name);
    expect(Array.isArray(query.data.value?.recipes)).toBe(true);

    app.unmount();
  });

  it("returns response shape { menu, recipes } with recipes for menu groupings", async () => {
    const menu = mockMenus[0];
    const [query, app] = withVueQuery(() =>
      useQuery(getMenuQuery(menu.id, menu.collectionId)),
    );

    await query.refetch();
    const data = query.data.value;
    expect(data?.menu).toMatchObject({
      id: menu.id,
      collectionId: menu.collectionId,
      name: menu.name,
      groupings: menu.groupings,
    });
    const expectedRecipeIds = menu.groupings.flatMap((g) => g.recipeIds);
    expect(data?.recipes?.length).toBe(expectedRecipeIds.length);
    expect(data?.recipes?.map((r) => r.id).sort()).toEqual(
      [...expectedRecipeIds].sort(),
    );

    app.unmount();
  });
});
