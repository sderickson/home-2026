<template>
  <div>
    <!-- List view: masonry columns (same idea as RecipeList), one block per grouping -->
    <template v-if="viewMode === 'menu'">
      <div class="menu-groupings-grid">
        <section
          v-for="(grouping, gIndex) in groupings"
          :key="gIndex"
          class="menu-grouping"
        >
          <h2
            class="text-caption text-medium-emphasis text-uppercase text-center mb-2 pb-2 border-b-sm opacity-90"
          >
            {{ grouping.name }}
          </h2>
          <ul class="menu-dish-list">
            <li
              v-for="recipeId in grouping.recipeIds"
              :key="recipeId"
              class="menu-dish-item"
            >
              <router-link
                :to="recipeLink(recipeId)"
                class="menu-dish-link text-decoration-none text-high-emphasis"
              >
                <span class="text-body-1 font-weight-medium d-block">{{
                  recipeById.get(recipeId)?.title ?? recipeId
                }}</span>
                <span
                  v-if="subtextByRecipeId.get(recipeId)"
                  class="text-body-2 text-medium-emphasis d-block mt-1"
                >
                  {{ subtextByRecipeId.get(recipeId) }}
                </span>
              </router-link>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <!-- Diner layout: menu title + compact cards with images -->
    <template v-else>
      <h2 v-if="menuTitle" class="menu-diner-title text-h6 mb-3">
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
              class="menu-diner-card"
              link
            >
              <div class="menu-diner-card-inner">
                <div class="menu-diner-card-media">
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
                    class="menu-diner-card-placeholder d-flex align-center justify-center"
                    height="64"
                    width="64"
                  >
                    <v-icon size="24" color="grey-lighten-1">
                      mdi-book-open-page-variant-outline
                    </v-icon>
                  </v-sheet>
                </div>
                <div class="menu-diner-card-body">
                  <div class="menu-diner-card-title">
                    {{ recipeById.get(recipeId)?.title ?? recipeId }}
                  </div>
                  <div
                    v-if="subtextByRecipeId.get(recipeId)"
                    class="menu-diner-card-subtitle"
                  >
                    {{ subtextByRecipeId.get(recipeId) }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  formatKeyIngredientsDisplay,
  getCardEnrichment,
  getRecipeQuery,
  filesListRecipesQuery,
} from "@sderickson/recipes-sdk";
import { computed } from "vue";
import { useQueries } from "@tanstack/vue-query";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
const props = defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipes: { id: string; title: string; subtitle?: string }[];
  menuId: string;
  collectionId: string;
  viewMode: "menu" | "diner";
  menuTitle?: string;
}>();

const uniqueRecipeIds = computed(() => {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const g of props.groupings) {
    for (const id of g.recipeIds) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
});

const detailQueries = useQueries({
  queries: computed(() =>
    uniqueRecipeIds.value.map((id) => getRecipeQuery(id)),
  ),
});

const filesQueries = useQueries({
  queries: computed(() =>
    uniqueRecipeIds.value.map((id) => filesListRecipesQuery(id)),
  ),
});

const recipeById = computed(() => {
  const map = new Map<
    string,
    { id: string; title: string; subtitle?: string }
  >();
  for (const r of props.recipes) {
    map.set(r.id, { id: r.id, title: r.title, subtitle: r.subtitle ?? "" });
  }
  return map;
});

const enrichmentByRecipeId = computed(() => {
  const map = new Map<
    string,
    {
      firstImageUrl: string | null;
      keyIngredients: {
        name: string;
        quantity: string;
        unit: string;
      }[];
    }
  >();
  uniqueRecipeIds.value.forEach((id, i) => {
    const detail = detailQueries.value[i]?.data;
    const files = filesQueries.value[i]?.data ?? undefined;
    map.set(id, getCardEnrichment(detail, files ?? undefined));
  });
  return map;
});

const subtextByRecipeId = computed(() => {
  const map = new Map<string, string>();
  for (const r of props.recipes) {
    const sub = r.subtitle?.trim();
    if (sub) {
      map.set(r.id, sub);
    } else {
      const enrichment = enrichmentByRecipeId.value.get(r.id);
      const text = enrichment
        ? formatKeyIngredientsDisplay(enrichment.keyIngredients)
        : "";
      if (text) map.set(r.id, text);
    }
  }
  return map;
});

function recipeLink(recipeId: string) {
  return constructPath(appLinks.menuRecipeDetail, {
    params: {
      collectionId: props.collectionId,
      menuId: props.menuId,
      recipeId,
    },
  });
}
</script>

<style scoped>
/* Masonry: match breakpoints in recipes/service/sdk/.../RecipeList.vue */
.menu-groupings-grid {
  column-count: 1;
  column-gap: 1rem;
}

@media (min-width: 600px) {
  .menu-groupings-grid {
    column-count: 2;
  }
}

@media (min-width: 960px) {
  .menu-groupings-grid {
    column-count: 3;
  }
}

@media (min-width: 1280px) {
  .menu-groupings-grid {
    column-count: 4;
  }
}

.menu-grouping {
  break-inside: avoid;
  margin-bottom: 1rem;
}

.menu-dish-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-dish-item {
  padding: 0.5rem 0;
}

.menu-dish-link {
  display: block;
  transition: color 0.15s ease;
}

.menu-dish-link:hover {
  color: rgb(var(--v-theme-primary));
}

.menu-diner-title {
  margin-top: 0;
  font-weight: 600;
}

.menu-diner-card {
  break-inside: avoid;
}

.menu-diner-card-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
}

.menu-diner-card-media {
  flex-shrink: 0;
}

.menu-diner-card-media :deep(.v-img),
.menu-diner-card-placeholder {
  border-radius: 4px;
}

.menu-diner-card-body {
  min-width: 0;
  flex: 1;
}

.menu-diner-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
}

.menu-diner-card-subtitle {
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
