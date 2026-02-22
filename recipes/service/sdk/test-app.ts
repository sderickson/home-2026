import { mountWithPlugins } from "@saflib/vue/testing";
import type { ComponentMountingOptions } from "@vue/test-utils";
import type { Component } from "vue";
import { recipes_sdk_strings } from "./strings.ts";
import { recipesServiceFakeHandlers } from "./fakes.ts";
import { router } from "./router.ts";

export const mountTestApp = <C extends Component>(
  Component: C,
  options: ComponentMountingOptions<C> = {},
) => {
  return mountWithPlugins(Component, options, {
    i18nMessages: {
      ...recipes_sdk_strings,
    },
    router,
  });
};

export const testAppHandlers = [...recipesServiceFakeHandlers];
