<template>
  <v-btn-toggle
    v-model="viewMode"
    mandatory
    variant="outlined"
    divided
    density="comfortable"
    selected-class="menu-view-toggle__btn--active"
    class="menu-view-toggle"
    :class="{ 'menu-view-toggle--block': block }"
  >
    <v-btn value="menu" prepend-icon="mdi-format-align-center">
      {{ t(strings.view_mode_menu) }}
    </v-btn>
    <v-btn value="diner" prepend-icon="mdi-view-grid-outline">
      {{ t(strings.view_mode_diner) }}
    </v-btn>
  </v-btn-toggle>
</template>

<script setup lang="ts">
/** Segmented Menu | Diner switch for a menu's two layouts. */
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { menus_detail as strings } from "./Detail.strings.ts";

defineProps<{
  /** Stretch to the full width (phones). */
  block?: boolean;
}>();

const viewMode = defineModel<"menu" | "diner">({ required: true });

const { t } = useReverseT();
</script>

<style scoped>
.menu-view-toggle {
  background: rgb(var(--v-theme-surface));
  border-color: rgb(var(--v-theme-outline));
}

.menu-view-toggle--block {
  flex: 1 1 auto;
}

.menu-view-toggle--block .v-btn {
  flex: 1 1 0;
}

.menu-view-toggle__btn--active {
  background: rgb(var(--v-theme-primary-tint));
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
</style>
