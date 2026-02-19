import { mountWithPlugins } from "@saflib/vue/testing";
import type { ComponentMountingOptions } from "@vue/test-utils";
import type { Component } from "vue";
import { hubSdkStrings } from "./strings.ts";
import { hubServiceFakeHandlers } from "./fakes.ts";
import { router } from "./router.ts";

export const mountTestApp = <C extends Component>(
  Component: C,
  options: ComponentMountingOptions<C> = {},
) => {
  return mountWithPlugins(Component, options, {
    i18nMessages: {
      ...hubSdkStrings,
    },
    router,
  });
};

export const testAppHandlers = [...hubServiceFakeHandlers];
