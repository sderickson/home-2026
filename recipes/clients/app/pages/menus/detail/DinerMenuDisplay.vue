<template>
  <div>
    <h2 v-if="menuTitle" class="diner-menu-title text-h6 mb-3">
      {{ menuTitle }}
    </h2>
    <div
      v-for="(grouping, gIndex) in groupings"
      :key="gIndex"
      class="mb-5"
    >
      <div class="text-subtitle-1 text-medium-emphasis mb-2">
        {{ grouping.name }}
      </div>
      <v-row dense>
        <v-col
          v-for="recipeId in grouping.recipeIds"
          :key="recipeId"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :to="recipeLink(recipeId)"
            variant="outlined"
            class="diner-menu-card"
            link
          >
            <div class="diner-menu-card-inner">
              <div class="diner-menu-card-media">
                <v-img
                  v-if="enrichmentByRecipeId.get(recipeId)?.firstImageUrl"
                  :src="enrichmentByRecipeId.get(recipeId)!.firstImageUrl!"
                  :alt="recipeById.get(recipeId)?.title ?? ''"
                  cover
                  height="64"
                  width="64"
                />
                <v-sheet
                  v-else
                  color="surface-variant"
                  class="diner-menu-card-placeholder d-flex align-center justify-center"
                  height="64"
                  width="64"
                >
                  <v-icon size="24" color="grey-lighten-1">
                    mdi-book-open-page-variant-outline
                  </v-icon>
                </v-sheet>
              </div>
              <div class="diner-menu-card-body">
                <div class="diner-menu-card-title">
                  {{ recipeById.get(recipeId)?.title ?? recipeId }}
                </div>
                <div
                  v-if="subtextByRecipeId.get(recipeId)"
                  class="diner-menu-card-subtitle"
                >
                  {{ subtextByRecipeId.get(recipeId) }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipeById: Map<
    string,
    { id: string; title: string; subtitle?: string }
  >;
  subtextByRecipeId: Map<string, string>;
  enrichmentByRecipeId: Map<
    string,
    {
      firstImageUrl: string | null;
      keyIngredients: {
        name: string;
        quantity: string;
        unit: string;
      }[];
    }
  >;
  menuTitle?: string;
  recipeLink: (recipeId: string) => string;
}>();
</script>

<style scoped>
.diner-menu-title {
  margin-top: 0;
  font-weight: 600;
}

.diner-menu-card {
  break-inside: avoid;
}

.diner-menu-card-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
}

.diner-menu-card-media {
  flex-shrink: 0;
}

.diner-menu-card-media :deep(.v-img),
.diner-menu-card-placeholder {
  border-radius: 4px;
}

.diner-menu-card-body {
  min-width: 0;
  flex: 1;
}

.diner-menu-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
}

.diner-menu-card-subtitle {
  font-size: 0.75rem;
  opacity: 0.85;
  line-height: 1.3;
  margin-top: 0.125rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
