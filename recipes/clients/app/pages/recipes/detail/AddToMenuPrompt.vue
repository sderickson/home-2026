<template>
  <v-card
    v-if="visible"
    variant="tonal"
    color="primary"
    class="mb-4 d-print-none"
  >
    <v-card-item :title="t(strings.title)" :subtitle="t(strings.body)" />
    <v-card-text>
      <MenuPlacementPicker v-model="placement" :menus="menus" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="dismiss">{{ t(strings.dismiss) }}</v-btn>
      <v-btn
        variant="flat"
        color="primary"
        :disabled="!isPlacementComplete(placement)"
        :loading="isPending"
        @click="add"
      >
        {{ t(strings.add) }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { listMenusQuery } from "@sderickson/recipes-sdk";
import { showInfo } from "@saflib/vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import MenuPlacementPicker from "../../../components/menus/MenuPlacementPicker.vue";
import { useAddRecipeToMenu } from "../../../components/menus/useAddRecipeToMenu.ts";
import {
  defaultSectionFor,
  isPlacementComplete,
  isRecipeOnAnyMenu,
  type MenuPlacement,
} from "../../../components/menus/menuPlacement.logic.ts";
import { add_to_menu_prompt as strings } from "./AddToMenuPrompt.strings.ts";

const props = defineProps<{
  collectionId: string;
  recipeId: string;
}>();

const { t } = useReverseT();

// Loaded here rather than in the page loader: the prompt is optional and
// shouldn't hold up the recipe.
const menusQuery = useQuery(computed(() => listMenusQuery(props.collectionId)));
const menus = computed(() => menusQuery.data.value?.menus ?? []);

const dismissKey = computed(
  () => `recipes:add-to-menu-dismissed:${props.recipeId}`,
);
const dismissed = ref(readDismissed());
watch(dismissKey, () => (dismissed.value = readDismissed()));

function readDismissed(): boolean {
  try {
    return localStorage.getItem(dismissKey.value) === "1";
  } catch {
    return false;
  }
}

function dismiss() {
  dismissed.value = true;
  try {
    localStorage.setItem(dismissKey.value, "1");
  } catch {
    // Storage unavailable: the prompt stays hidden for this visit only.
  }
}

const visible = computed(
  () =>
    !dismissed.value &&
    menus.value.length > 0 &&
    !isRecipeOnAnyMenu(menus.value, props.recipeId),
);

const placement = ref<MenuPlacement>({ menuId: null, section: "" });
// Preselect the first menu once menus arrive.
watch(
  menus,
  (list) => {
    if (placement.value.menuId || list.length === 0) return;
    placement.value = {
      menuId: list[0]!.id,
      section: defaultSectionFor(list[0]),
    };
  },
  { immediate: true },
);

const { addRecipeToMenu, isPending } = useAddRecipeToMenu();

async function add() {
  const menu = menus.value.find((m) => m.id === placement.value.menuId);
  if (!menu || !isPlacementComplete(placement.value)) return;
  await addRecipeToMenu(menu, placement.value.section, props.recipeId);
  showInfo(t(strings.added, { menu: menu.name }));
}
</script>
