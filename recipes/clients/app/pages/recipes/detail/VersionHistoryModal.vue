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
              {{
                ver.isLatest
                  ? t(strings.version_latest)
                  : (t(strings.version_from_date) as string).replace(
                      "{date}",
                      formatVersionDate(ver.createdAt),
                    )
              }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <RecipeContentPreview
                :title="recipe.title"
                :short-description="recipe.shortDescription"
                :long-description="recipe.longDescription ?? undefined"
                :content="ver.content"
              />
              <template v-if="notesByVersionId.get(ver.id)?.length">
                <p class="text-caption text-medium-emphasis mt-2 mb-1">
                  {{ t(strings.notes_for_version) }}
                </p>
                <ul class="text-body-2 pl-4 mb-0">
                  <li
                    v-for="n in notesByVersionId.get(ver.id)"
                    :key="n.id"
                    class="mb-1"
                  >
                    {{ n.body }}
                    <span
                      v-if="n.everEdited"
                      class="text-caption text-medium-emphasis"
                    >
                      ({{ t(strings.ever_edited) }})
                    </span>
                  </li>
                </ul>
              </template>
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
import type { RecipeNote, RecipeVersion } from "@sderickson/recipes-spec";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { version_history_modal as strings } from "./VersionHistoryModal.strings.ts";
import { formatVersionDate } from "./Detail.logic.ts";

defineProps<{
  modelValue: boolean;
  recipe: {
    title: string;
    shortDescription: string;
    longDescription?: string | null;
  };
  versions: RecipeVersion[];
  notesByVersionId: Map<string, RecipeNote[]>;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const { t } = useReverseT();
</script>
