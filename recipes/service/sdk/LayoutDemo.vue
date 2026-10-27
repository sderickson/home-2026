<template>
  <div style="padding: 16px; max-width: 1040px">
    <v-card class="paper">
      <RecipeContentPreview :recipe="recipe" :current-version="version">
        <template #stamp-start>
          <span>On:</span>
          <a href="#">Weeknight Dinners</a><span>·</span><a href="#">Sunday Brunch</a>
        </template>
        <template #stamp>
          <v-btn icon="$prev" variant="text" size="x-small" />
          <span>Version: Oct 27, 2026</span>
          <v-btn icon="$next" variant="text" size="x-small" />
        </template>
      </RecipeContentPreview>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import RecipeContentPreview from "./components/recipe-content-preview/RecipeContentPreview.vue";
const recipe = { id: "r", title: "Classic Chocolate Chip Cookies", subtitle: "Crispy edges, chewy centers", description: "A crowd-pleaser.", createdBy: "", createdAt: "", updatedBy: "", updatedAt: "" } as never;
const version = { id: "v", recipeId: "r", isLatest: true, createdBy: "", createdAt: "", content: { ingredients: [{ name: "flour", quantity: "2", unit: "cups" }], instructionsMarkdown: "1. Mix." } } as never;
</script>
