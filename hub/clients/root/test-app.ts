import { mountWithPlugins } from "@saflib/vue/testing";
import type { ComponentMountingOptions } from "@vue/test-utils";
import type { Component } from "vue";
import { createMemoryHistory, type Router } from "vue-router";
import { createRootRouter } from "./router.ts";
import { root_strings } from "./strings.ts";
import { recipesServiceFakeHandlers } from "@sderickson/recipes-sdk/fakes";

export const createTestRouter = () =>
  createRootRouter({ history: createMemoryHistory() });

export const mountTestApp = <C extends Component>(
  Component: C,
  options: ComponentMountingOptions<C> = {},
  overrides: { router?: Router } = {},
) => {
  return mountWithPlugins(Component, options, {
    router: overrides.router ?? createTestRouter(),
    i18nMessages: {
      ...root_strings,
    },
  });
};

export const testAppHandlers = [...recipesServiceFakeHandlers];
