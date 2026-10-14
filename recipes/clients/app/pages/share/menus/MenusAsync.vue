<template>
  <AsyncPage :loader="useMenusLoader" :page-component="Menus">
    <template #error="{ error }">
      <MenusError :error="error" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useMenusLoader } from "./Menus.loader.ts";
import { share_menus as strings } from "./Menus.strings.ts";
import { AsyncPage } from "@saflib/vue/components";
import { useAsyncPageDocumentTitle } from "@saflib/vue";
import MenusError from "./MenusError.vue";

const loader = useMenusLoader();

useAsyncPageDocumentTitle(
  strings.documentTitle,
  computed(() => loader.sharedMenuQuery.data.value?.menu.name),
);

const Menus = defineAsyncComponent(() => import("./Menus.vue"));
</script>
