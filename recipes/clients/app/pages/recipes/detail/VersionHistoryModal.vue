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
                  <template v-if="firstNoteFirstLine(ver)">
                    {{ firstNoteFirstLine(ver) }}
                  </template>
                  <i18n-t
                    v-else
                    scope="global"
                    :keypath="lookupTKey(strings.version_from_date)"
                  >
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
import type {
  RecipeNote,
  RecipeVersion,
  Recipe,
} from "@sderickson/recipes-spec";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { version_history_modal as strings } from "./VersionHistoryModal.strings.ts";
import { formatVersionDate } from "./Detail.logic.ts";

const props = defineProps<{
  modelValue: boolean;
  recipe: Recipe;
  versions: RecipeVersion[];
  notesByVersionId: Map<string, RecipeNote[]>;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const { t, lookupTKey } = useReverseT();

/** First line of the first note for this version (commit-message style), or null if none. */
function firstNoteFirstLine(ver: RecipeVersion): string | null {
  const notes = props.notesByVersionId.get(ver.id) ?? [];
  const firstNote = [...notes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )[0];
  if (!firstNote?.body?.trim()) return null;
  const firstLine = firstNote.body.split(/\r?\n/)[0].trim();
  return firstLine || null;
}

/** If the version was updated after creation, returns updatedAt (for when the API supports it). */
function versionUpdatedAt(ver: RecipeVersion): string | undefined {
  const v = ver as RecipeVersion & { updatedAt?: string };
  if (!v.updatedAt || v.updatedAt === ver.createdAt) return undefined;
  return v.updatedAt;
}
</script>
