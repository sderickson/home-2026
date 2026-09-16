import { describe, it, expect, vi, beforeEach } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import HomeAsync from "./HomeAsync.vue";
import { mountTestApp, testAppHandlers } from "@sderickson/hub-account-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { kratosSessionLoggedInHandler } from "@sderickson/recipes-sdk/fakes";

describe("Home", () => {
  stubGlobals();
  const server = setupMockServer(testAppHandlers);
  beforeEach(() => {
    server.use(kratosSessionLoggedInHandler);
  });

  it("should render", async () => {
    const wrapper = mountTestApp(HomeAsync);
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("Account settings"),
    );
    wrapper.unmount();
  });
});
