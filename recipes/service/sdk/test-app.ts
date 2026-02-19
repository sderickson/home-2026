import { mountWithPlugins } from "@saflib/vue/testing";
import type { ComponentMountingOptions } from "@vue/test-utils";
import type { Component } from "vue";
import { recipesSdkStrings } from "./strings.ts";
import { recipesServiceFakeHandlers } from "./fakes.ts";
import { router } from "./router.ts";

export const mountTestApp = <C extends Component>(
  Component: C,
  options: ComponentMountingOptions<C> = {},
) => {
  return mountWithPlugins(Component, options, {
    i18nMessages: {
      ...recipesSdkStrings,
    },
    router,
  });
};

export const testAppHandlers = [...recipesServiceFakeHandlers];
