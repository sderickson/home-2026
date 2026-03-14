import { afterEach, describe, it, expect } from "vitest";
import { listMenusQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockMenus, resetMocks } from "./mocks.ts";

describe("listMenus", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns list of menus from fake handler (collection-scoped)", async () => {
    const [query, app] = withVueQuery(() =>
      useQuery(listMenusQuery("my-kitchen")),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(query.data.value?.menus).toBeDefined();
    expect(Array.isArray(query.data.value?.menus)).toBe(true);
    expect(query.data.value?.menus).toHaveLength(mockMenus.length);
    expect(query.data.value?.menus?.[0]?.name).toBe(mockMenus[0].name);

    app.unmount();
  });

  it("returns menus with expected shape (id, name, collectionId, groupings)", async () => {
    const [query, app] = withVueQuery(() =>
      useQuery(listMenusQuery("my-kitchen")),
    );

    await query.refetch();
    const menus = query.data.value?.menus;
    expect(menus?.length).toBeGreaterThan(0);
    expect(menus?.[0]).toMatchObject({
      id: expect.any(String),
      collectionId: "my-kitchen",
      name: expect.any(String),
      isPublic: expect.any(Boolean),
      groupings: expect.any(Array),
    });

    app.unmount();
  });
});
