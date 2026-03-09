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
              @keydown.tab="onFocusTargetTab($event, i)"
              @keydown.shift.tab="onFocusTargetTab($event, i, true)"
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

function onRowTab(e: KeyboardEvent, i: number, shift?: boolean) {
  commitEdit();
  if (shift) {
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
      nextTick(() => newRowInputRef.value?.focus?.());
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
      newRowInputRef.value?.focus?.();
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
    nextTick(() => newRowInputRef.value?.focus?.());
  }
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
