<template>
  <div class="recipe-ingredients-form w-100">
    <v-table density="compact" class="ingredients-table">
      <thead>
        <tr>
          <th class="text-left text-caption font-weight-bold pa-2" style="width: 5rem">
            {{ t(strings.col_quantity) }}
          </th>
          <th class="text-left text-caption font-weight-bold pa-2" style="width: 5rem">
            {{ t(strings.col_unit) }}
          </th>
          <th class="text-left text-caption font-weight-bold pa-2">
            {{ t(strings.col_food) }}
          </th>
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
            <td colspan="3" class="pa-0">
              <v-text-field
                :ref="(el) => setRowInputRef(i, el)"
                v-model="editingValue"
                variant="outlined"
                density="compact"
                hide-details
                class="w-100"
                :placeholder="t(strings.row_placeholder)"
                @blur="commitEdit"
                @keydown.tab="onRowTab($event, i)"
                @keydown.shift.tab="onRowTab($event, i, true)"
                @keydown.enter="onRowEnter($event, i)"
                @keydown.shift.enter="onRowEnter($event, i, true)"
                @keydown.escape="cancelEdit"
              />
            </td>
          </template>
          <template v-else>
            <td
              class="focus-target text-left pa-2"
              style="width: 5rem"
              tabindex="0"
              :data-index="i"
              @focus="startEdit(i)"
              @click="startEdit(i)"
            >
              {{ ing.quantity }}
            </td>
            <td
              class="text-left pa-2"
              style="width: 5rem"
              @click="startEdit(i)"
            >
              {{ ing.unit }}
            </td>
            <td
              class="text-left pa-2"
              @click="startEdit(i)"
            >
              {{ ing.name }}
            </td>
          </template>
        </tr>
        <tr class="new-row">
          <td colspan="3" class="pa-2">
            <v-text-field
              ref="newRowInputRef"
              v-model="newRowValue"
              variant="outlined"
              density="compact"
              hide-details
              class="w-100"
              :placeholder="t(strings.row_placeholder)"
              @keydown.tab="onNewRowTab"
              @keydown.shift.tab="onNewRowShiftTab"
              @keydown.enter="onNewRowEnter"
              @keydown.shift.enter="onNewRowShiftTab"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import { recipe_ingredients_form as strings } from "./RecipeIngredientsForm.strings.ts";
import {
  parseIngredientLine,
  formatIngredient,
  type RecipeIngredient,
} from "./RecipeIngredientsForm.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();

const props = defineProps<{
  modelValue: RecipeIngredient[];
}>();

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
interface Focusable {
  focus?: () => void;
}
const rowInputRefs: (Focusable | null)[] = [];
const newRowInputRef = ref<Focusable | null>(null);

function setRowInputRef(i: number, el: unknown) {
  rowInputRefs[i] = el as Focusable | null;
}

function startEdit(i: number) {
  editingIndex.value = i;
  const ing = list.value[i];
  editingValue.value = ing ? formatIngredient(ing) : "";
  nextTick(() => {
    const input = rowInputRefs[i];
    input?.focus?.();
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

function cancelEdit() {
  if (editingIndex.value === null) return;
  const i = editingIndex.value;
  editingIndex.value = null;
  editingValue.value = "";
  nextTick(() => {
    const focusTarget = document.querySelector(
      `.recipe-ingredients-form .focus-target[data-index="${i}"]`,
    ) as HTMLElement | null;
    focusTarget?.focus();
  });
}

const FOCUSABLE_SELECTOR =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusPreviousInForm(current: EventTarget | null) {
  const el = current instanceof HTMLElement ? current : null;
  const form = el?.closest("form");
  if (!form) return;
  const focusable = Array.from(form.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const idx = focusable.findIndex((node) => node === el || node.contains(el));
  if (idx > 0) focusable[idx - 1].focus();
}

/** On Tab/Shift+Tab from row edit input: do nothing. Blur will commit; browser handles focus. */
function onRowTab(_e: KeyboardEvent, _i: number, _shift?: boolean) {
  // Do not preventDefault — browser moves focus by default tab order.
  // Blur fires when focus leaves the input and will call commitEdit().
}

/** Enter doesn't move focus by default, so we mimic Tab: commit then focus next/prev. */
function onRowEnter(e: KeyboardEvent, i: number, shift?: boolean) {
  if (shift && i === 0) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  commitEdit();
  nextTick(() => {
    if (shift) {
      if (i > 0) {
        const prev = document.querySelector(
          `.recipe-ingredients-form .focus-target[data-index="${i - 1}"]`,
        ) as HTMLElement | null;
        prev?.focus();
      } else {
        focusPreviousInForm(e.target);
      }
    } else {
      if (i < list.value.length - 1) {
        const nextTarget = document.querySelector(
          `.recipe-ingredients-form .focus-target[data-index="${i + 1}"]`,
        ) as HTMLElement | null;
        nextTarget?.focus();
      } else {
        newRowInputRef.value?.focus?.();
      }
    }
  });
}

function onNewRowEnter(e: KeyboardEvent) {
  e.preventDefault();
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
    nextTick(() => newRowInputRef.value?.focus?.());
  }
}

function onNewRowShiftTab(_e: KeyboardEvent) {
  // Do not preventDefault — let the browser move focus to previous element (last row or checkbox)
}

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
.ingredient-row:not(.is-editing) .focus-target {
  cursor: pointer;
  outline: none;
}
.ingredient-row:not(.is-editing) td {
  cursor: pointer;
}
</style>
