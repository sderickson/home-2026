import { afterEach, describe, it, expect } from "vitest";
import { sharedGetMenusQuery } from "./shared-get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockMenus, resetMocks } from "./mocks.ts";

describe("sharedGetMenus", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns the menu with its recipes, versions, and shared file URLs", async () => {
    const menu = mockMenus[0];
    const [query, app] = withVueQuery(() =>
      useQuery(sharedGetMenusQuery(menu.id)),
    );

    await query.refetch();
    const data = query.data.value;
    expect(data?.menu.id).toBe(menu.id);
    const recipeIds = new Set(menu.groupings.flatMap((g) => g.recipeIds));
    expect(data?.recipes.every((r) => recipeIds.has(r.id))).toBe(true);
    expect(data?.currentVersions.length).toBe(data?.recipes.length);
    for (const f of data?.files ?? []) {
      expect(f.downloadUrl).toBe(
        `/recipes/${f.recipeId}/shared/files/${f.id}/blob`,
      );
    }

    app.unmount();
  });
});
