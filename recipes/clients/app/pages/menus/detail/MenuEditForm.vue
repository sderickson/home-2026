<template>
  <v-form ref="formRef" class="menu-edit" @submit.prevent="onSubmit">
    <div class="menu-edit__bar">
      <p class="eyebrow">{{ t(strings.editing_menu) }}</p>
      <div class="d-flex ga-2">
        <v-btn
          type="button"
          variant="outlined"
          class="bg-surface"
          @click="emit('cancel')"
        >
          {{ t(strings.cancel) }}
        </v-btn>
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          prepend-icon="mdi-check"
          :loading="updateMutation.isPending.value"
        >
          {{ t(strings.submit) }}
        </v-btn>
      </div>
    </div>

    <div class="menu-edit__name paper">
      <label :for="nameInputId" class="section-label menu-edit__name-label">
        {{ t(strings.name_label) }}
      </label>
      <input
        :id="nameInputId"
        v-model="form.name"
        class="menu-edit__name-input font-title"
        :placeholder="t(strings.name_placeholder)"
        autocomplete="off"
      />
    </div>

    <p class="eyebrow menu-edit__sections-label">
      {{ t(strings.groupings_label) }}
    </p>

    <div ref="sectionsRef" class="menu-edit__sections">
      <section
        v-for="(grouping, gIndex) in form.groupings"
        :key="grouping._uid ?? gIndex"
        class="menu-edit-section paper"
      >
        <div class="menu-edit-section__head">
          <v-icon
            icon="mdi-drag"
            size="small"
            class="section-drag-handle text-muted"
            :aria-label="t(strings.drag_section)"
          />
          <v-text-field
            v-model="grouping.name"
            :placeholder="t(strings.grouping_name_placeholder)"
            variant="outlined"
            density="compact"
            hide-details
            class="menu-edit-section__name"
          />
          <span class="menu-edit-section__count font-mono text-muted">
            {{ t(strings.recipe_count, { count: grouping.recipeIds.length }) }}
          </span>
          <v-spacer />
          <v-btn
            type="button"
            variant="text"
            color="error"
            size="small"
            icon="mdi-delete-outline"
            :aria-label="t(strings.remove_grouping)"
            @click="emit('removeGrouping', gIndex)"
          />
          <v-btn
            type="button"
            variant="text"
            size="small"
            :icon="isExpanded(grouping) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            :aria-label="
              isExpanded(grouping)
                ? t(strings.collapse_section)
                : t(strings.expand_section)
            "
            :aria-expanded="isExpanded(grouping)"
            @click="toggleExpanded(grouping)"
          />
        </div>

        <!-- v-show (not v-if) keeps the lists mounted for their Sortable instances. -->
        <div v-show="isExpanded(grouping)" class="menu-edit-section__body">
          <ul class="menu-edit-list" :data-section-index="gIndex">
            <li
              v-for="recipeId in grouping.recipeIds"
              :key="recipeId"
              class="menu-edit-list-item"
            >
              <v-icon
                icon="mdi-drag"
                size="small"
                class="menu-edit-drag-handle text-muted"
                :aria-label="t(strings.drag_handle)"
              />
              <span class="flex-grow-1">{{ recipeTitle(recipeId) }}</span>
              <v-btn
                type="button"
                variant="text"
                size="small"
                icon="mdi-close"
                :aria-label="t(strings.remove_recipe)"
                @click="removeRecipeFromSection(recipeId, gIndex)"
              />
            </li>
          </ul>
          <v-autocomplete
            :key="`${gIndex}-${autocompleteRemountKey[gIndex] ?? 0}`"
            :items="availableRecipes"
            item-title="title"
            item-value="id"
            :placeholder="t(strings.add_recipe_placeholder)"
            prepend-inner-icon="mdi-plus"
            variant="outlined"
            bg-color="surface-tab"
            density="comfortable"
            hide-details
            class="menu-edit-autocomplete"
            @update:model-value="
              (id: string | null) => onAutocompleteSelect(id, gIndex)
            "
          />
        </div>
      </section>
    </div>

    <v-btn
      type="button"
      variant="text"
      color="primary"
      block
      prepend-icon="mdi-plus"
      class="menu-edit__add-section"
      @click="addSection"
    >
      {{ t(strings.add_grouping) }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  reactive,
  nextTick,
  onBeforeUnmount,
  onMounted,
  useId,
  watch,
} from "vue";
import Sortable, { type SortableEvent } from "sortablejs";
import type { MenuEditFormModel } from "./Detail.logic.ts";
import { buildUpdateMenuPayload } from "./Detail.logic.ts";
import { useUpdateMenuMutation } from "@sderickson/recipes-sdk";
import { menu_edit_form as strings } from "./MenuEditForm.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

type Grouping = MenuEditFormModel["groupings"][number];

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
const nameInputId = useId();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const updateMutation = useUpdateMenuMutation();

/** Increment after each pick so the autocomplete remounts with a cleared field (Vuetify keeps search text otherwise). */
const autocompleteRemountKey = reactive<Record<number, number>>({});

/** Expanded sections, by grouping object. The first section starts open. */
const expanded = reactive(new Set<Grouping>());
if (props.form.groupings[0]) expanded.add(props.form.groupings[0]);

function isExpanded(g: Grouping) {
  return expanded.has(g);
}

function toggleExpanded(g: Grouping) {
  if (expanded.has(g)) expanded.delete(g);
  else expanded.add(g);
}

function addSection() {
  emit("addGrouping");
  // The parent pushes synchronously; open the new section.
  const added = props.form.groupings[props.form.groupings.length - 1];
  if (added) expanded.add(added);
}

const sectionsRef = ref<HTMLElement | null>(null);
let sectionsSortable: Sortable | null = null;
let recipeListSortables: Sortable[] = [];

/** Undo Sortable's DOM move so Vue re-renders from the reordered array. */
function revertDomMove(evt: SortableEvent, oldIndex: number) {
  const { item, from } = evt;
  from.removeChild(item);
  from.insertBefore(item, from.children[oldIndex] ?? null);
}

function initSectionsSortable() {
  sectionsSortable?.destroy();
  if (!sectionsRef.value) return;
  sectionsSortable = Sortable.create(sectionsRef.value, {
    handle: ".section-drag-handle",
    draggable: ".menu-edit-section",
    ghostClass: "section-drag-ghost",
    onEnd(evt: SortableEvent) {
      const { oldIndex, newIndex } = evt;
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      )
        return;
      revertDomMove(evt, oldIndex);
      const arr = props.form.groupings;
      const [item] = arr.splice(oldIndex, 1);
      arr.splice(newIndex, 0, item);
    },
  });
}

function initRecipeListSortables() {
  recipeListSortables.forEach((s) => s.destroy());
  recipeListSortables = [];
  const listEls =
    sectionsRef.value?.querySelectorAll<HTMLElement>(".menu-edit-list") ?? [];
  listEls.forEach((el) => {
    const sortable = Sortable.create(el, {
      handle: ".menu-edit-drag-handle",
      ghostClass: "menu-edit-drag-ghost",
      onEnd(evt: SortableEvent) {
        const { oldIndex, newIndex, from } = evt;
        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldIndex === newIndex
        )
          return;
        revertDomMove(evt, oldIndex);
        const sectionIndex = parseInt(
          (from as HTMLElement).dataset.sectionIndex ?? "0",
          10,
        );
        const ids = props.form.groupings[sectionIndex]?.recipeIds;
        if (!ids) return;
        const [item] = ids.splice(oldIndex, 1);
        ids.splice(newIndex, 0, item);
      },
    });
    recipeListSortables.push(sortable);
  });
}

onMounted(() => {
  initSectionsSortable();
  nextTick(initRecipeListSortables);
});

watch(
  () => props.form.groupings.length,
  () => nextTick(initRecipeListSortables),
);

onBeforeUnmount(() => {
  sectionsSortable?.destroy();
  recipeListSortables.forEach((s) => s.destroy());
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
    autocompleteRemountKey[sectionIndex] =
      (autocompleteRemountKey[sectionIndex] ?? 0) + 1;
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
.menu-edit {
  max-width: 920px;
  margin: 0 auto;
}

.menu-edit__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

/* ---------- Menu name ---------- */
.menu-edit__name {
  padding: 18px 24px 20px;
  border-radius: 4px;
}

.menu-edit__name-label {
  display: block;
  line-height: 1.6;
}

.menu-edit__name-input {
  width: 100%;
  padding: 2px 0 6px;
  border: 0;
  border-bottom: 2px solid rgb(var(--v-theme-card-red-line));
  outline: none;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  font-size: 40px;
  line-height: 1.15;
}

.menu-edit__name-input:focus {
  border-bottom-color: rgb(var(--v-theme-error));
}

.menu-edit__sections-label {
  margin: 36px 0 14px;
}

/* ---------- Sections ---------- */
.menu-edit__sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* White card with the index card's red line along the top. */
.menu-edit-section {
  border-top: 2px solid rgb(var(--v-theme-card-red-line));
  border-radius: 2px;
}

.menu-edit-section__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 10px 14px;
}

.menu-edit-section__name {
  flex: 0 1 320px;
}

.menu-edit-section__name :deep(input) {
  font-family: var(--font-title);
  font-weight: 600;
  font-size: 20px;
}

.menu-edit-section__count {
  flex: none;
  font-size: 13px;
}

.menu-edit-section__body {
  padding: 0 16px 16px;
  border-top: 1px solid rgb(var(--v-theme-card-red-line-soft));
}

.menu-edit-list {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
}

.menu-edit-list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 46px;
  padding-left: 16px;
  border-bottom: 1px solid rgb(var(--v-theme-card-rule));
  font-size: 16px;
}

.menu-edit-autocomplete {
  margin-top: 12px;
}

.menu-edit-drag-handle,
.section-drag-handle {
  cursor: grab;
}

.menu-edit-drag-handle:active,
.section-drag-handle:active {
  cursor: grabbing;
}

.menu-edit-drag-ghost,
.section-drag-ghost {
  opacity: 0.5;
}

/* Dashed "Add section" slot under the last card. */
.menu-edit__add-section.v-btn {
  height: 54px;
  margin-top: 16px;
  border: 1.5px dashed #a8a091;
  border-radius: 2px;
  font-weight: 600;
}
</style>
