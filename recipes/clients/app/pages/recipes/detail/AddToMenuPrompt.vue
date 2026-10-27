<template>
  <v-sheet
    v-if="visible"
    color="primary-tint"
    rounded="lg"
    class="add-to-menu-prompt d-flex flex-wrap align-center ga-2 mb-4 py-2 pl-4 pr-2 d-print-none"
  >
    <div class="flex-1-1 add-to-menu-prompt__text">
      <div class="text-body-1 font-weight-medium">{{ t(strings.title) }}</div>
      <div class="text-body-2 text-medium-emphasis">{{ t(strings.body) }}</div>
    </div>
    <div class="d-flex ga-1 ml-auto">
      <v-btn variant="text" @click="dismiss">{{ t(strings.dismiss) }}</v-btn>
      <v-btn variant="flat" color="primary" @click="dialogOpen = true">
        {{ t(strings.add) }}
      </v-btn>
    </div>
  </v-sheet>

  <v-dialog v-model="dialogOpen" max-width="520">
    <v-card :title="t(strings.dialog_title)">
      <v-card-text>
        <MenuPlacementPicker v-model="placement" :menus="menus" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogOpen = false">
          {{ t(strings.cancel) }}
        </v-btn>
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
  </v-dialog>
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
const dialogOpen = ref(false);

async function add() {
  const menu = menus.value.find((m) => m.id === placement.value.menuId);
  if (!menu || !isPlacementComplete(placement.value)) return;
  await addRecipeToMenu(menu, placement.value.section, props.recipeId);
  dialogOpen.value = false;
  showInfo(t(strings.added, { menu: menu.name }));
}
</script>

<style scoped>
/* Keep the text column from squeezing the buttons onto their own line too early. */
.add-to-menu-prompt__text {
  min-width: 14rem;
}
</style>
