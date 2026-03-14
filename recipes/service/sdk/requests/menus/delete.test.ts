import { afterEach, describe, it, expect } from "vitest";
import { useDeleteMenuMutation } from "./delete.ts";
import { listMenusQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockMenus, resetMocks } from "./mocks.ts";

describe("deleteMenu", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("works at all: deletes menu and removes it from mock data", async () => {
    const menu = mockMenus[mockMenus.length - 1];
    const [mutation, app] = withVueQuery(() => useDeleteMenuMutation());
    const countBefore = mockMenus.length;

    await mutation.mutateAsync({ id: menu.id, collectionId: menu.collectionId });

    expect(mockMenus).toHaveLength(countBefore - 1);
    expect(mockMenus.some((m) => m.id === menu.id)).toBe(false);

    app.unmount();
  });

  it("caching works: related queries are invalidated after the mutation", async () => {
    const menu = mockMenus[mockMenus.length - 1];
    const [listQuery, app] = withVueQuery(() =>
      useQuery(listMenusQuery(menu.collectionId)),
    );
    const [mutation] = withVueQuery(() => useDeleteMenuMutation());

    await listQuery.refetch();
    expect(listQuery.data.value?.menus?.some((m) => m.id === menu.id)).toBe(true);

    await mutation.mutateAsync({ id: menu.id, collectionId: menu.collectionId });
    await listQuery.refetch();
    expect(listQuery.data.value?.menus?.some((m) => m.id === menu.id)).toBe(false);

    app.unmount();
  });
});
