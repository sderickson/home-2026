import { describe, it, expect, vi, beforeEach } from "vitest";
import { stubGlobals, mountWithPlugins } from "@saflib/vue/testing";
import { createMemoryHistory } from "vue-router";
import AccountSpa from "./AccountSpa.vue";
import { createAccountRouter } from "./router.ts";
import { testAppHandlers } from "./test-app.ts";
import { account_strings } from "./strings.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { kratosSessionLoggedInHandler } from "@sderickson/recipes-sdk/fakes";

describe("AccountSpa", () => {
  stubGlobals();
  const server = setupMockServer(testAppHandlers);
  beforeEach(() => {
    server.use(kratosSessionLoggedInHandler);
  });

  it("should render the logged-in account shell", async () => {
    const router = createAccountRouter({ history: createMemoryHistory() });
    await router.push("/profile");
    await router.isReady();

    const wrapper = mountWithPlugins(
      AccountSpa,
      {},
      {
        router,
        i18nMessages: account_strings,
      },
    );
    await vi.waitFor(() => expect(wrapper.text()).toContain("Account settings"));
    expect(wrapper.text()).toContain("Profile");
    wrapper.unmount();
  });
});
