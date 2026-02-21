<template>
  <form class="create-recipe-form" @submit.prevent>
    <v-text-field
      v-model="model.title"
      :label="t(strings.title_label)"
      :placeholder="t(strings.title_placeholder)"
      variant="outlined"
      class="mb-2"
    />
    <v-text-field
      v-model="model.shortDescription"
      :label="t(strings.short_description_label)"
      :placeholder="t(strings.short_description_placeholder)"
      variant="outlined"
      class="mb-2"
    />
    <v-text-field
      v-model="model.longDescription"
      :label="t(strings.long_description_label)"
      :placeholder="t(strings.long_description_placeholder)"
      variant="outlined"
      class="mb-2"
    />
    <v-checkbox
      v-model="model.isPublic"
      :label="t(strings.is_public_label)"
      :hint="t(strings.is_public_hint)"
      persistent-hint
      class="mb-2"
    />
    <div class="mb-2">
      <div class="text-subtitle-2 mb-1">{{ t(strings.ingredients_label) }}</div>
      <div
        v-for="(ing, i) in content().ingredients"
        :key="i"
        class="d-flex gap-2 align-center mb-1"
      >
        <v-text-field
          v-model="ing.quantity"
          :placeholder="t(strings.ingredient_quantity_placeholder)"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-0"
          style="max-width: 6rem"
        />
        <v-text-field
          v-model="ing.unit"
          :placeholder="t(strings.ingredient_unit_placeholder)"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-0"
          style="max-width: 6rem"
        />
        <v-text-field
          v-model="ing.name"
          :placeholder="t(strings.ingredient_name_placeholder)"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1"
        />
        <v-btn
          icon="mdi-minus"
          variant="text"
          size="small"
          @click="removeIngredient(i)"
        />
      </div>
      <v-btn
        variant="outlined"
        size="small"
        class="mt-1"
        @click="addIngredient"
      >
        {{ t(strings.add_ingredient) }}
      </v-btn>
    </div>
    <v-textarea
      v-model="content().instructionsMarkdown"
      :label="t(strings.instructions_label)"
      :placeholder="t(strings.instructions_placeholder)"
      variant="outlined"
      rows="6"
      class="mb-2"
    />
  </form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import { create_recipe_form as strings } from "./CreateRecipeForm.strings.ts";
import { isCreateRecipeFormValid } from "./CreateRecipeForm.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();

export type CreateRecipeModel = Omit<
  RecipesServiceRequestBody["createRecipe"],
  "initialVersion"
> & {
  initialVersion: {
    content: {
      ingredients: { name: string; quantity: string; unit: string }[];
      instructionsMarkdown: string;
    };
  };
};

const model = defineModel<CreateRecipeModel>({ required: true });

function content() {
  return model.value.initialVersion.content;
}

function addIngredient() {
  content().ingredients.push({
    name: "",
    quantity: "",
    unit: "",
  });
}

function removeIngredient(index: number) {
  content().ingredients.splice(index, 1);
}

const isValid = computed(() => isCreateRecipeFormValid(model.value));

defineExpose({ isValid });
</script>
