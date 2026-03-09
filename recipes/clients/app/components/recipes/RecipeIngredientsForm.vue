<template>
  <div class="recipe-ingredients-form">
    <table class="ingredients-table">
      <thead>
        <tr>
          <th class="col-quantity">{{ quantityLabel }}</th>
          <th class="col-unit">{{ unitLabel }}</th>
          <th class="col-name">{{ nameLabel }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(ing, i) in list"
          :key="i"
          class="ingredient-row"
          :class="{ 'is-editing': editingIndex === i }"
        >
          <template v-if="editingIndex === i">
            <td colspan="3" class="edit-cell">
              <input
                :ref="(el) => setRowInputRef(i, el)"
                v-model="editingValue"
                type="text"
                class="row-input"
                :placeholder="rowPlaceholder"
                @blur="commitEdit"
                @keydown.tab="onRowTab($event, i)"
                @keydown.shift.tab="onRowTab($event, i, true)"
              />
            </td>
          </template>
          <template v-else>
            <td
              class="col-quantity focus-target"
              tabindex="0"
              :data-index="i"
              @focus="startEdit(i)"
              @click="startEdit(i)"
              @keydown.tab="onFocusTargetTab($event, i)"
              @keydown.shift.tab="onFocusTargetTab($event, i, true)"
            >
              {{ ing.quantity }}
            </td>
            <td
              class="col-unit"
              @click="startEdit(i)"
            >
              {{ ing.unit }}
            </td>
            <td
              class="col-name"
              @click="startEdit(i)"
            >
              {{ ing.name }}
            </td>
          </template>
        </tr>
        <tr class="new-row">
          <td colspan="3" class="edit-cell">
            <input
              ref="newRowInputRef"
              v-model="newRowValue"
              type="text"
              class="row-input"
              :placeholder="rowPlaceholder"
              @keydown.tab="onNewRowTab"
              @keydown.shift.tab="onNewRowShiftTab"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";

type RecipeIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: RecipeIngredient[];
    rowPlaceholder?: string;
    quantityLabel?: string;
    unitLabel?: string;
    nameLabel?: string;
  }>(),
  {
    rowPlaceholder: "e.g. 2 cups flour",
    quantityLabel: "Quantity",
    unitLabel: "Unit",
    nameLabel: "Food",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: RecipeIngredient[]];
}>();

// Local copy kept in sync with prop so we always have a stable reference when updating
const list = ref<RecipeIngredient[]>([]);
watch(
  () => props.modelValue ?? [],
  (val) => {
    list.value = val.length ? val.map((ing) => ({ ...ing })) : [];
  },
  { immediate: true, deep: true },
);

function emitList(value: RecipeIngredient[]) {
  emit("update:modelValue", value);
}

const editingIndex = ref<number | null>(null);
const editingValue = ref("");
const newRowValue = ref("");
const rowInputRefs: (HTMLInputElement | null)[] = [];
const newRowInputRef = ref<HTMLInputElement | null>(null);

function setRowInputRef(i: number, el: unknown) {
  rowInputRefs[i] = el as HTMLInputElement | null;
}

/**
 * Parse a single line into quantity, unit, and name.
 * First token = quantity, second = unit, rest = name.
 */
function parseIngredientLine(line: string): RecipeIngredient {
  const trimmed = line.trim();
  if (!trimmed) {
    return { quantity: "", unit: "", name: "" };
  }
  const parts = trimmed.split(/\s+/);
  const quantity = parts[0] ?? "";
  const unit = parts[1] ?? "";
  const name = parts.slice(2).join(" ") ?? "";
  return { quantity, unit, name };
}

function formatIngredient(ing: RecipeIngredient): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
  return parts.join(" ");
}

function startEdit(i: number) {
  editingIndex.value = i;
  const ing = list.value[i];
  editingValue.value = ing ? formatIngredient(ing) : "";
  nextTick(() => {
    const input = rowInputRefs[i];
    input?.focus();
  });
}

function commitEdit() {
  if (editingIndex.value === null) return;
  const i = editingIndex.value;
  const parsed = parseIngredientLine(editingValue.value);
  const isEmpty =
    !parsed.quantity.trim() && !parsed.unit.trim() && !parsed.name.trim();
  const next = [...list.value];
  if (isEmpty) {
    next.splice(i, 1);
  } else {
    next[i] = parsed;
  }
  list.value = next;
  emitList(next);
  editingIndex.value = null;
  editingValue.value = "";
}

function onRowTab(e: KeyboardEvent, i: number, shift?: boolean) {
  commitEdit();
  if (shift) {
    // Shift+Tab: go to previous row or previous focusable
    if (i > 0) {
      e.preventDefault();
      nextTick(() => {
        const prev = document.querySelector(
          `.recipe-ingredients-form .focus-target[data-index="${i - 1}"]`,
        ) as HTMLElement | null;
        prev?.focus();
      });
    }
  } else {
    // Tab: go to next row or new row
    if (i < list.value.length - 1) {
      e.preventDefault();
      nextTick(() => {
        const nextTarget = document.querySelector(
          `.recipe-ingredients-form .focus-target[data-index="${i + 1}"]`,
        ) as HTMLElement | null;
        nextTarget?.focus();
      });
    } else {
      e.preventDefault();
      nextTick(() => newRowInputRef.value?.focus());
    }
  }
}

function onFocusTargetTab(e: KeyboardEvent, i: number, shift?: boolean) {
  if (shift) {
    if (i > 0) {
      e.preventDefault();
      const prev = document.querySelector(
        `.recipe-ingredients-form .focus-target[data-index="${i - 1}"]`,
      ) as HTMLElement | null;
      prev?.focus();
    }
  } else {
    e.preventDefault();
    if (i < list.value.length - 1) {
      const nextTarget = document.querySelector(
        `.recipe-ingredients-form .focus-target[data-index="${i + 1}"]`,
      ) as HTMLElement | null;
      nextTarget?.focus();
    } else {
      newRowInputRef.value?.focus();
    }
  }
}

function onNewRowTab(e: KeyboardEvent) {
  const value = newRowValue.value.trim();
  if (value) {
    e.preventDefault();
    const parsed = parseIngredientLine(value);
    const next = [...list.value, parsed];
    list.value = next;
    emitList(next);
    newRowValue.value = "";
    nextTick(() => newRowInputRef.value?.focus());
  }
  // else: let default tab happen → focus goes to next element (instructions)
}

function onNewRowShiftTab(e: KeyboardEvent) {
  if (list.value.length > 0) {
    e.preventDefault();
    const lastIndex = list.value.length - 1;
    const lastTarget = document.querySelector(
      `.recipe-ingredients-form .focus-target[data-index="${lastIndex}"]`,
    ) as HTMLElement | null;
    lastTarget?.focus();
  }
}

// When ingredients list changes (e.g. from parent), clear refs that are out of bounds
watch(
  () => list.value.length,
  (len, prev) => {
    if (len < prev) {
      rowInputRefs.splice(len);
    }
  },
);
</script>

<style scoped>
.recipe-ingredients-form {
  width: 100%;
}

.ingredients-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.ingredients-table th {
  text-align: left;
  padding: 0.25rem 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.ingredients-table td {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  vertical-align: middle;
}

.col-quantity {
  width: 5rem;
}

.col-unit {
  width: 5rem;
}

.col-name {
  min-width: 0;
}

.ingredient-row:not(.is-editing) .col-quantity,
.ingredient-row:not(.is-editing) .col-unit,
.ingredient-row:not(.is-editing) .col-name {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.ingredient-row.is-editing .edit-cell {
  padding: 0;
}

.focus-target {
  outline: none;
  cursor: text;
}

.ingredient-row:not(.is-editing) td {
  cursor: pointer;
}

.row-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  font: inherit;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.38);
  border-radius: 4px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-sizing: border-box;
}

.row-input:focus {
  border-color: rgb(var(--v-theme-primary));
  outline: none;
}

.row-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.new-row .edit-cell {
  padding: 0.25rem 0;
  border-bottom: none;
}
</style>
