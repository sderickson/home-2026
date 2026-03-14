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

    <v-expansion-panels
      ref="sectionsPanelsRef"
      variant="accordion"
      class="menu-edit-sections mb-4"
    >
      <v-expansion-panel
        v-for="(grouping, gIndex) in form.groupings"
        :key="grouping._uid ?? gIndex"
        class="menu-edit-section"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center gap-2 flex-grow-1">
            <v-btn
              type="button"
              variant="text"
              size="small"
              icon="mdi-drag"
              class="section-drag-handle"
              :aria-label="t(strings.drag_section)"
              @click.stop
            />
            <v-text-field
              v-model="grouping.name"
              :placeholder="t(strings.grouping_name_placeholder)"
              variant="outlined"
              density="compact"
              hide-details
              class="flex-grow-1"
              style="max-width: 280px"
              @click.stop
            />
            <v-btn
              type="button"
              variant="text"
              color="error"
              size="small"
              icon="mdi-close"
              :aria-label="t(strings.remove_grouping)"
              @click.stop="emit('removeGrouping', gIndex)"
            />
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <draggable
            v-model="grouping.recipeIds"
            :item-key="(id: string) => id"
            tag="div"
            class="menu-edit-list mb-2"
            handle=".menu-edit-drag-handle"
            ghost-class="menu-edit-drag-ghost"
            drag-class="menu-edit-drag-dragging"
          >
            <template #item="{ element: recipeId }">
              <v-list-item class="menu-edit-list-item">
                <template #prepend>
                  <v-btn
                    type="button"
                    variant="text"
                    size="small"
                    icon="mdi-drag"
                    class="menu-edit-drag-handle"
                    :aria-label="t(strings.drag_handle)"
                  />
                </template>
                <span class="flex-grow-1">{{ recipeTitle(recipeId) }}</span>
                <template #append>
                  <v-btn
                    type="button"
                    variant="text"
                    size="small"
                    icon="mdi-close"
                    :aria-label="t(strings.remove_recipe)"
                    @click="removeRecipeFromSection(recipeId, gIndex)"
                  />
                </template>
              </v-list-item>
            </template>
          </draggable>
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
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

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
import { ref, computed, reactive, nextTick, onMounted } from "vue";
import Sortable, { type SortableEvent } from "sortablejs";
import draggable from "vuedraggable";
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
const sectionsPanelsRef = ref<{ $el: HTMLElement } | null>(null);

onMounted(() => {
  const el = sectionsPanelsRef.value?.$el;
  if (!el || !props.form.groupings.length) return;
  Sortable.create(el, {
    handle: ".section-drag-handle",
    ghostClass: "section-drag-ghost",
    dragClass: "section-drag-dragging",
    onEnd(evt: SortableEvent) {
      const { oldIndex, newIndex } = evt;
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      )
        return;
      const arr = props.form.groupings;
      const [item] = arr.splice(oldIndex, 1);
      arr.splice(newIndex, 0, item);
    },
  });
});

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
.menu-edit-list {
  background: transparent;
}
.menu-edit-list-item {
  min-height: 40px;
}
.menu-edit-drag-handle {
  cursor: grab;
}
.menu-edit-drag-handle:active {
  cursor: grabbing;
}
.menu-edit-drag-ghost {
  opacity: 0.5;
}
.menu-edit-drag-dragging {
  cursor: grabbing;
}
.menu-edit-autocomplete {
  max-width: 320px;
}
.section-drag-handle {
  cursor: grab;
}
.section-drag-handle:active {
  cursor: grabbing;
}
.section-drag-ghost {
  opacity: 0.6;
}
.section-drag-dragging {
  cursor: grabbing;
}
</style>
