import { afterEach, describe, it, expect } from "vitest";
import { useUpdateMenuMutation } from "./update.ts";
import { listMenusQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockMenus, resetMocks } from "./mocks.ts";

describe("updateMenu", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("works at all: updates menu and returns { menu }", async () => {
    const menu = mockMenus[0];
    const [mutation, app] = withVueQuery(() => useUpdateMenuMutation());
    const body = {
      id: menu.id,
      collectionId: menu.collectionId,
      name: "Updated Menu Name",
      isPublic: true,
      groupings: [{ name: "Updated Group", recipeIds: [] }],
    };

    const result = await mutation.mutateAsync(body);

    expect(result).toBeDefined();
    expect(result.menu).toBeDefined();
    expect(result.menu.name).toBe(body.name);
    expect(result.menu.isPublic).toBe(body.isPublic);
    expect(result.menu.groupings).toEqual(body.groupings);
    expect(mockMenus[0].name).toBe(body.name);

    app.unmount();
  });

  it("caching works: related queries are invalidated after the mutation", async () => {
    const menu = mockMenus[0];
    const [listQuery, app] = withVueQuery(() =>
      useQuery(listMenusQuery(menu.collectionId)),
    );
    const [mutation] = withVueQuery(() => useUpdateMenuMutation());

    await listQuery.refetch();
    await mutation.mutateAsync({
      id: menu.id,
      collectionId: menu.collectionId,
      name: "Cache Test Updated",
      isPublic: menu.isPublic,
      groupings: menu.groupings,
    });
    await listQuery.refetch();

    expect(listQuery.data.value?.menus?.find((m) => m.id === menu.id)?.name).toBe(
      "Cache Test Updated",
    );

    app.unmount();
  });
});
