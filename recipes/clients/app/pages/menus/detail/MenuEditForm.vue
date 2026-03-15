<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-card class="mb-4">
      <v-toolbar density="comfortable">
        <v-toolbar-title
          class="text-h6 menu-edit-title"
          @click="openNameDialog"
        >
          {{ form.name || t(strings.name_placeholder) }}
        </v-toolbar-title>
        <v-spacer />
        <v-tooltip location="bottom" :text="t(strings.submit)">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              type="submit"
              color="primary"
              icon
              :loading="updateMutation.isPending.value"
              :aria-label="t(strings.submit)"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip location="bottom" :text="t(strings.cancel)">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              type="button"
              variant="text"
              icon
              :aria-label="t(strings.cancel)"
              @click="emit('cancel')"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </v-toolbar>

      <div class="menu-edit-body pa-3">
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
            <v-expansion-panel-text eager>
              <div class="menu-edit-list mb-2" :data-section-index="gIndex">
                <v-list-item
                  v-for="recipeId in grouping.recipeIds"
                  :key="recipeId"
                  class="menu-edit-list-item"
                >
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
              </div>
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
                @update:model-value="
                  (id: string | null) => onAutocompleteSelect(id, gIndex)
                "
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-btn
          type="button"
          variant="outlined"
          class="mt-3"
          prepend-icon="mdi-plus"
          @click="emit('addGrouping')"
        >
          {{ t(strings.add_grouping) }}
        </v-btn>
      </div>
    </v-card>

    <v-dialog v-model="nameDialogOpen" max-width="400" persistent>
      <v-card>
        <v-card-title>{{ t(strings.name_label) }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="nameDialogValue"
            :placeholder="t(strings.name_placeholder)"
            variant="outlined"
            autofocus
            @keydown.enter.prevent="saveNameAndClose"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="nameDialogOpen = false">
            {{ t(strings.cancel) }}
          </v-btn>
          <v-btn color="primary" @click="saveNameAndClose">
            {{ t(strings.submit) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted, watch } from "vue";
import Sortable, { type SortableEvent } from "sortablejs";
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
  cancel: [];
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
const recipeListSortables = ref<Sortable[]>([]);
const nameDialogOpen = ref(false);
const nameDialogValue = ref("");

function openNameDialog() {
  nameDialogValue.value = props.form.name;
  nameDialogOpen.value = true;
}

function saveNameAndClose() {
  props.form.name = nameDialogValue.value.trim() || props.form.name;
  nameDialogOpen.value = false;
}

function initSectionPanelsSortable() {
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
}

function initRecipeListSortables() {
  recipeListSortables.value.forEach((s) => s.destroy());
  recipeListSortables.value = [];
  const panelsEl = sectionsPanelsRef.value?.$el;
  if (!panelsEl) return;
  const listEls = panelsEl.querySelectorAll<HTMLElement>(".menu-edit-list");
  listEls.forEach((el) => {
    const sortable = Sortable.create(el, {
      handle: ".menu-edit-drag-handle",
      ghostClass: "menu-edit-drag-ghost",
      dragClass: "menu-edit-drag-dragging",
      onEnd(evt: SortableEvent) {
        const { oldIndex, newIndex, from } = evt;
        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldIndex === newIndex
        )
          return;
        const sectionIndex = parseInt(
          (from as HTMLElement).dataset.sectionIndex ?? "0",
          10,
        );
        const grouping = props.form.groupings[sectionIndex];
        if (!grouping?.recipeIds) return;
        const ids = grouping.recipeIds;
        const [item] = ids.splice(oldIndex, 1);
        ids.splice(newIndex, 0, item);
      },
    });
    recipeListSortables.value.push(sortable);
  });
}

onMounted(() => {
  initSectionPanelsSortable();
  nextTick(initRecipeListSortables);
});

watch(
  () => props.form.groupings.length,
  () => nextTick(initRecipeListSortables),
);

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
.menu-edit-title {
  cursor: pointer;
}
.menu-edit-title:hover {
  opacity: 0.85;
}
</style>
