import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import KratosSettingsAsync from "./SettingsAsync.vue";
import { mountTestApp, createTestRouter, testAppHandlers } from "@sderickson/hub-auth-spa/test-app";
import { kratosSessionLoggedInHandler, resetMocks } from "@sderickson/recipes-sdk/fakes";
import { setupMockServer } from "@saflib/sdk/testing/mock";

describe("KratosSettings", () => {
  stubGlobals();
  const server = setupMockServer(testAppHandlers);
  beforeEach(() => {
    server.use(kratosSessionLoggedInHandler);
  });
  afterEach(resetMocks);

  it("should render", async () => {
    const router = createTestRouter();
    await router.push("/settings");
    await router.isReady();

    const wrapper = mountTestApp(KratosSettingsAsync, {}, { router });
    await vi.waitFor(() => expect(wrapper.text()).toContain("Account settings"));
    wrapper.unmount();
  });
});
