<template>
  <v-list v-if="menus.length > 0">
    <v-list-item
      v-for="menu in menus"
      :key="menu.id"
      v-bind="
        linkToProps(appLinks.menusDetail, {
          params: { collectionId, id: menu.id },
        })
      "
      :title="menu.name"
      :subtitle="menu.isPublic ? t(strings.public) : t(strings.private)"
      rounded="lg"
    />
  </v-list>
</template>

<script setup lang="ts">
import { appLinks } from "@sderickson/recipes-links";
import { linkToProps } from "@saflib/links";
import { menus_list_display as strings } from "./MenusListDisplay.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

defineProps<{
  menus: { id: string; name: string; isPublic: boolean }[];
  collectionId: string;
}>();

const { t } = useReverseT();
</script>
