<template>
  <v-container fluid max-width="1240" class="share-menu pa-0 pt-md-4">
    <div class="share-menu__bar d-print-none">
      <MenuViewToggle v-model="viewMode" :block="!mdAndUp" />
    </div>

    <FancyMenuDisplay
      v-if="viewMode === 'menu'"
      :groupings="menu.groupings"
      :recipe-by-id="display.recipeById"
      :subtext-by-recipe-id="display.subtextByRecipeId"
      :recipe-link="recipeLink"
      :menu-title="menu.name"
    />
    <DinerMenuDisplay
      v-else
      :groupings="menu.groupings"
      :recipe-by-id="display.recipeById"
      :subtext-by-recipe-id="display.subtextByRecipeId"
      :enrichment-by-recipe-id="display.enrichmentByRecipeId"
      :recipe-link="recipeLink"
      :menu-title="menu.name"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useDisplay } from "vuetify";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { useMenusLoader } from "./Menus.loader.ts";
import { assertSharedMenuLoaded, sharedMenuDisplayData } from "./Menus.logic.ts";
import MenuViewToggle from "../../menus/detail/MenuViewToggle.vue";
import FancyMenuDisplay from "../../menus/detail/FancyMenuDisplay.vue";
import DinerMenuDisplay from "../../menus/detail/DinerMenuDisplay.vue";

const { sharedMenuQuery } = useMenusLoader();

assertSharedMenuLoaded(sharedMenuQuery.data.value);

const { mdAndUp } = useDisplay();

const menu = computed(() => sharedMenuQuery.data.value!.menu);
const display = computed(() =>
  sharedMenuDisplayData(sharedMenuQuery.data.value!),
);

const viewMode = ref<"menu" | "diner">("menu");

/** Dishes open the recipe's public share page. */
function recipeLink(recipeId: string) {
  return constructPath(appLinks.shareRecipes, { params: { id: recipeId } });
}
</script>

<style scoped>
.share-menu {
  padding-bottom: 48px !important;
}

.share-menu__bar {
  display: flex;
  margin-bottom: 24px;
}
</style>
