import { createVueApp } from "@saflib/vue";
import { recipes_sdk_strings } from "./strings";
import LayoutDemo from "./LayoutDemo.vue";
createVueApp(LayoutDemo, { i18nMessages: { ...recipes_sdk_strings } });
