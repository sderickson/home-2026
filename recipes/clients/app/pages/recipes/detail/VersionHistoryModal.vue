<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
    @click:outside="$emit('update:modelValue', false)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        {{ t(strings.title) }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>
      <v-card-text>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            v-for="ver in versions"
            :key="ver.id"
            :value="ver.id"
          >
            <v-expansion-panel-title>
              <div class="d-flex flex-column py-1">
                <span class="text-body-1">
                  <i18n-t scope="global" :keypath="lookupTKey(strings.version_from_date)">
                    <template #date>{{ formatVersionDate(ver.createdAt) }}</template>
                  </i18n-t>
                </span>
                <span class="text-caption text-medium-emphasis mt-1">
                  {{ t(strings.created_date) }}:
                  {{ formatVersionDate(ver.createdAt) }}
                  <template v-if="versionUpdatedAt(ver)">
                    · {{ t(strings.updated_date) }}:
                    {{ formatVersionDate(versionUpdatedAt(ver)!) }}
                  </template>
                </span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <RecipeContentPreview :recipe="recipe" :current-version="ver" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ t(strings.close) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type {
  RecipeVersion,
  Recipe,
} from "@sderickson/recipes-spec";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { version_history_modal as strings } from "./VersionHistoryModal.strings.ts";
import { formatVersionDate } from "./Detail.logic.ts";

defineProps<{
  modelValue: boolean;
  recipe: Recipe;
  versions: RecipeVersion[];
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const { t, lookupTKey } = useReverseT();

/** If the version was updated after creation, returns updatedAt (for when the API supports it). */
function versionUpdatedAt(ver: RecipeVersion): string | undefined {
  const v = ver as RecipeVersion & { updatedAt?: string };
  if (!v.updatedAt || v.updatedAt === ver.createdAt) return undefined;
  return v.updatedAt;
}
</script>
