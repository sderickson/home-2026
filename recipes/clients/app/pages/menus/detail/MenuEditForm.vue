<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-text-field
      v-model="form.name"
      :label="t(strings.name_label)"
      variant="outlined"
      class="mb-4"
    />
    <v-switch
      v-model="form.isPublic"
      :label="t(strings.is_public_label)"
      class="mb-4"
    />
    <div class="text-subtitle-1 mb-2">{{ t(strings.groupings_label) }}</div>

    <div
      v-for="(grouping, gIndex) in form.groupings"
      :key="gIndex"
      class="menu-edit-section mb-4"
    >
      <div class="d-flex align-center gap-2 mb-2">
        <v-text-field
          v-model="grouping.name"
          :placeholder="t(strings.grouping_name_placeholder)"
          variant="outlined"
          density="comfortable"
          hide-details
          class="flex-grow-1"
          style="max-width: 240px"
        />
        <v-btn
          type="button"
          variant="text"
          color="error"
          icon="mdi-close"
          :aria-label="t(strings.remove_grouping)"
          @click="emit('removeGrouping', gIndex)"
        />
      </div>
      <v-list density="compact" class="menu-edit-list mb-2">
        <v-list-item
          v-for="recipeId in grouping.recipeIds"
          :key="recipeId"
          class="menu-edit-list-item"
        >
          <span class="flex-grow-1">{{ recipeTitle(recipeId) }}</span>
          <v-btn
            type="button"
            variant="text"
            size="small"
            icon="mdi-close"
            :aria-label="t(strings.remove_recipe)"
            @click="removeRecipeFromSection(recipeId, gIndex)"
          />
        </v-list-item>
      </v-list>
      <v-autocomplete
        :model-value="autocompleteBySection[gIndex] ?? null"
        :items="availableRecipes"
        item-title="title"
        item-value="id"
        :placeholder="t(strings.add_recipe_placeholder)"
        variant="outlined"
        density="comfortable"
        hide-details
        clearable
        class="menu-edit-autocomplete"
        @update:model-value="(id: string | null) => onAutocompleteSelect(id, gIndex)"
      />
    </div>

    <v-btn
      type="button"
      variant="outlined"
      class="mb-4"
      prepend-icon="mdi-plus"
      @click="emit('addGrouping')"
    >
      {{ t(strings.add_grouping) }}
    </v-btn>

    <v-btn
      type="submit"
      color="primary"
      :loading="updateMutation.isPending.value"
    >
      {{ t(strings.submit) }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from "vue";
import type { MenuEditFormModel } from "./Detail.logic.ts";
import { buildUpdateMenuPayload } from "./Detail.logic.ts";
import { useUpdateMenuMutation } from "@sderickson/recipes-sdk";
import { menu_edit_form as strings } from "./MenuEditForm.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const props = defineProps<{
  form: MenuEditFormModel;
  recipes: { id: string; title: string }[];
  menuId: string;
  collectionId: string;
}>();

const emit = defineEmits<{
  saved: [];
  addGrouping: [];
  removeGrouping: [index: number];
}>();

const { t } = useReverseT();
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const updateMutation = useUpdateMenuMutation();
const autocompleteBySection = reactive<Record<number, string | null>>({});

const assignedRecipeIds = computed(() => {
  const set = new Set<string>();
  for (const g of props.form.groupings) {
    for (const id of g.recipeIds ?? []) set.add(id);
  }
  return set;
});

const availableRecipes = computed(() =>
  props.recipes.filter((r) => !assignedRecipeIds.value.has(r.id)),
);

function recipeTitle(recipeId: string): string {
  return props.recipes.find((r) => r.id === recipeId)?.title ?? recipeId;
}

function onAutocompleteSelect(id: string | null, sectionIndex: number) {
  if (id) {
    addRecipeToSection(id, sectionIndex);
    nextTick(() => {
      autocompleteBySection[sectionIndex] = null;
    });
  } else {
    autocompleteBySection[sectionIndex] = null;
  }
}

function addRecipeToSection(recipeId: string, sectionIndex: number) {
  const g = props.form.groupings[sectionIndex];
  if (!g) return;
  if (!g.recipeIds) g.recipeIds = [];
  if (!g.recipeIds.includes(recipeId)) g.recipeIds.push(recipeId);
}

function removeRecipeFromSection(recipeId: string, sectionIndex: number) {
  const g = props.form.groupings[sectionIndex];
  if (!g?.recipeIds) return;
  const i = g.recipeIds.indexOf(recipeId);
  if (i >= 0) g.recipeIds.splice(i, 1);
}

async function onSubmit() {
  const { valid } = (await formRef.value?.validate()) ?? { valid: true };
  if (!valid) return;
  const payload = buildUpdateMenuPayload(
    props.form,
    props.menuId,
    props.collectionId,
  );
  await updateMutation.mutateAsync({
    id: payload.id,
    collectionId: payload.collectionId,
    name: payload.name,
    isPublic: payload.isPublic,
    groupings: payload.groupings,
  });
  emit("saved");
}
</script>

<style scoped>
.menu-edit-section {
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 4px;
  padding: 12px;
}
.menu-edit-list {
  background: transparent;
}
.menu-edit-list-item {
  min-height: 40px;
}
.menu-edit-autocomplete {
  max-width: 320px;
}
</style>
