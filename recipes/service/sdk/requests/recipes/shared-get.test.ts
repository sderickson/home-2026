// @ts-nocheck — scaffold placeholders until sdk/add-query or sdk/add-mutation copies this file.
import { afterEach, describe, it, expect } from "vitest";
import { sharedGetRecipesQuery } from "./shared-get.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { useQuery } from "@tanstack/vue-query";
import { setupScopedMockServer } from "#test/scoped-mock.ts";
import { sharedGetRecipesHandler } from "./shared-get.fake.ts";
// @ts-expect-error TODO: use mock data
import { mockRecipes, resetMocks } from "./mocks.ts";

describe("sharedGetRecipes", () => {
  setupScopedMockServer([sharedGetRecipesHandler]);
  afterEach(resetMocks);

  // TODO: Make sure the fake data gets returned, and unskip this test
  it.skip("TODO", async () => {
    const [query, app] = withVueQuery(() =>
      useQuery(sharedGetRecipesQuery({})),
    );

    await query.refetch();
    expect(query.data).toBeDefined();

    app.unmount();
  });
});
