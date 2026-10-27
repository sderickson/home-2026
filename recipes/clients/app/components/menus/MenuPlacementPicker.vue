<template>
  <div class="d-flex flex-column flex-sm-row ga-3">
    <v-select
      :model-value="model.menuId"
      :items="menuItems"
      :label="t(strings.menu_label)"
      variant="outlined"
      density="comfortable"
      hide-details
      class="flex-1-1"
      @update:model-value="selectMenu"
    />
    <v-combobox
      v-if="model.menuId"
      :model-value="model.section"
      :items="sectionNames"
      :label="t(strings.section_label)"
      :hint="t(strings.section_hint)"
      variant="outlined"
      density="comfortable"
      persistent-hint
      class="flex-1-1"
      @update:model-value="(v) => (model.section = v ?? '')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Menu } from "@sderickson/recipes-spec";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import {
  defaultSectionFor,
  type MenuPlacement,
} from "./menuPlacement.logic.ts";
import { menu_placement_picker as strings } from "./MenuPlacementPicker.strings.ts";

const props = defineProps<{
  menus: Menu[];
  /** Offer "None" so the placement can be skipped. */
  allowNone?: boolean;
}>();

const model = defineModel<MenuPlacement>({ required: true });
const { t } = useReverseT();

const menuItems = computed(() => [
  ...(props.allowNone ? [{ title: t(strings.menu_none), value: null }] : []),
  ...props.menus.map((m) => ({ title: m.name, value: m.id })),
]);

const selectedMenu = computed(() =>
  props.menus.find((m) => m.id === model.value.menuId),
);
const sectionNames = computed(
  () => selectedMenu.value?.groupings.map((g) => g.name) ?? [],
);

function selectMenu(menuId: string | null) {
  model.value = {
    menuId,
    section: defaultSectionFor(props.menus.find((m) => m.id === menuId)),
  };
}
</script>
