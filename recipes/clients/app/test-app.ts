import { mountWithPlugins } from "@saflib/vue/testing";
import type { ComponentMountingOptions } from "@vue/test-utils";
import type { Component } from "vue";
import { createAppRouter } from "./router.ts";
import { app_strings } from "./strings.ts";
import { identityServiceFakeHandlers } from "@saflib/auth/fakes";
import { createMemoryHistory, type Router } from "vue-router";

export const createTestRouter = () =>
  createAppRouter({ history: createMemoryHistory() });

export const mountTestApp = <C extends Component>(
  Component: C,
  options: ComponentMountingOptions<C> = {},
  overrides: { router?: Router } = {},
) => {
  return mountWithPlugins(Component, options, {
    router: overrides.router ?? createTestRouter(),
    i18nMessages: {
      ...app_strings,
    },
  });
};

// TODO: import and add here any other mock handlers from sdk packages this SPA depends on
export const testAppHandlers = [...identityServiceFakeHandlers];
