<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    persistent
    class="quick-import-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="d-flex flex-column" style="max-height: 90vh">
      <v-card-title class="d-flex align-center">
        {{ t(strings.dialog_title) }}
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>
      <v-card-text class="flex-grow-1 overflow-auto">
        <v-text-field
          v-model="title"
          :label="t(strings.title_label)"
          :placeholder="t(strings.title_placeholder)"
          variant="outlined"
          class="mb-3"
        />
        <v-row>
          <v-col cols="12" md="6" class="d-flex flex-column">
            <v-label class="text-body-2 mb-1">{{ t(strings.paste_label) }}</v-label>
            <v-textarea
              v-model="pasteText"
              :placeholder="t(strings.paste_placeholder)"
              variant="outlined"
              class="flex-grow-1 quick-import-dialog__textarea"
              rows="14"
              auto-grow
            />
          </v-col>
          <v-col cols="12" md="6" class="d-flex flex-column">
            <v-label class="text-body-2 mb-1">Preview</v-label>
            <div class="quick-import-dialog__preview rounded border pa-3 overflow-auto">
              <RecipeContentPreview
                :recipe="previewRecipe"
                :current-version="previewVersion"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ t(strings.cancel) }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!canSave"
          :loading="saving"
          @click="handleSave"
        >
          {{ t(strings.save) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Recipe, RecipeVersion } from "@sderickson/recipes-spec";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useCreateRecipeMutation } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { quick_import as strings } from "./QuickImport.strings.ts";
import { parseRecipePaste } from "./parseRecipePaste.ts";

const { t } = useReverseT();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [recipeId: string];
}>();

const title = ref("");
const pasteText = ref("");
const saving = ref(false);

const createMutation = useCreateRecipeMutation();

const parsed = computed(() => parseRecipePaste(pasteText.value));

const previewRecipe = computed((): Recipe => ({
  id: "",
  title: title.value || "(Untitled)",
  subtitle: "",
  description: null,
  isPublic: true,
  createdBy: "",
  createdAt: "",
  updatedBy: "",
  updatedAt: "",
}));

const previewVersion = computed((): RecipeVersion => ({
  id: "",
  recipeId: "",
  content: {
    ingredients: parsed.value.ingredients,
    instructionsMarkdown: parsed.value.instructionsMarkdown,
  },
  isLatest: true,
  createdBy: "",
  createdAt: "",
}));

const canSave = computed(
  () =>
    title.value.trim() !== "" &&
    (parsed.value.ingredients.length > 0 || parsed.value.instructionsMarkdown !== ""),
);

function reset() {
  title.value = "";
  pasteText.value = "";
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) reset();
  },
);

async function handleSave() {
  if (!canSave.value || saving.value) return;
  saving.value = true;
  try {
    const data = await createMutation.mutateAsync({
      collectionId: "my-kitchen",
      title: title.value.trim(),
      subtitle: "",
      isPublic: true,
      initialVersion: {
        content: {
          ingredients: parsed.value.ingredients,
          instructionsMarkdown: parsed.value.instructionsMarkdown,
        },
      },
    });
    emit("update:modelValue", false);
    emit("success", data.recipe.id);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.quick-import-dialog__textarea :deep(textarea) {
  min-height: 280px;
}

.quick-import-dialog__preview {
  min-height: 280px;
  background: rgb(var(--v-theme-surface-variant), 0.3);
}
</style>
