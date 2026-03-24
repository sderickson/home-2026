import { describe, it, expect, vi, beforeEach } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import RecipesCreateAsync from "./CreateAsync.vue";
import {
  createTestRouter,
  mountTestApp,
  testAppHandlers,
} from "@sderickson/recipes-app-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { kratosSessionLoggedInHandler } from "@sderickson/recipes-sdk/fakes";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("RecipesCreate", () => {
  stubGlobals();
  const server = setupMockServer(testAppHandlers);
  beforeEach(() => {
    server.use(kratosSessionLoggedInHandler);
  });

  it("should render", async () => {
    const router = createTestRouter();
    await router.push("/c/my-kitchen/recipes/create");
    await router.isReady();

    const wrapper = mountTestApp(RecipesCreateAsync, {}, { router });
    await vi.waitFor(() => expect(wrapper.text()).toContain("Create recipe"));
    wrapper.unmount();
  });
});
