import { afterEach, describe, it, expect } from "vitest";
import { useCreateMenuMutation } from "./create.ts";
import { listMenusQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockMenus, resetMocks } from "./mocks.ts";

describe("createMenu", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("works at all: creates menu and returns { menu }", async () => {
    const [mutation, app] = withVueQuery(() => useCreateMenuMutation());
    const body = {
      collectionId: "my-kitchen",
      name: "New Menu",
      groupings: [{ name: "Starters", recipeIds: [] }],
    };

    const result = await mutation.mutateAsync(body);

    expect(result).toBeDefined();
    expect(result.menu).toBeDefined();
    expect(result.menu.name).toBe(body.name);
    expect(result.menu.collectionId).toBe(body.collectionId);
    expect(result.menu.groupings).toEqual(body.groupings);
    expect(mockMenus).toContainEqual(expect.objectContaining({ name: body.name }));

    app.unmount();
  });

  it("caching works: related queries are invalidated after the mutation", async () => {
    const collectionId = "my-kitchen";
    const [listQuery, app] = withVueQuery(() =>
      useQuery(listMenusQuery(collectionId)),
    );
    const [mutation] = withVueQuery(() => useCreateMenuMutation());

    await listQuery.refetch();
    const countBefore = listQuery.data.value?.menus?.length ?? 0;

    await mutation.mutateAsync({
      collectionId,
      name: "Cache Test Menu",
      groupings: [],
    });
    await listQuery.refetch();
    const countAfter = listQuery.data.value?.menus?.length ?? 0;

    expect(countAfter).toBe(countBefore + 1);
    expect(listQuery.data.value?.menus?.some((m) => m.name === "Cache Test Menu")).toBe(true);

    app.unmount();
  });
});
