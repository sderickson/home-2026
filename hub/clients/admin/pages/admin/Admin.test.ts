import { describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import AdminAsync from "./AdminAsync.vue";
import { mountTestApp, testAppHandlers } from "@sderickson/hub-admin-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("Admin", () => {
  stubGlobals();
  setupMockServer(testAppHandlers);

  it("should render", async () => {
    const wrapper = mountTestApp(AdminAsync);
    await vi.waitFor(() => expect(wrapper.text()).toContain("Admin"));
    wrapper.unmount();
  });
});
