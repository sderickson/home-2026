<template>
  <section class="archived-recipes mt-8 d-print-none">
    <v-btn
      variant="text"
      prepend-icon="mdi-archive-outline"
      :append-icon="open ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ open ? t(strings.hide_archived) : t(strings.show_archived) }}
    </v-btn>

    <div v-if="open" class="mt-3">
      <h2 class="d-sr-only">{{ t(strings.archived_heading) }}</h2>
      <v-progress-linear v-if="archivedQuery.isPending.value" indeterminate />
      <v-alert
        v-else-if="archivedQuery.isError.value"
        type="error"
        variant="tonal"
      >
        {{ t(strings.load_failed) }}
      </v-alert>
      <p v-else-if="archivedRecipes.length === 0" class="text-muted px-4">
        {{ t(strings.no_archived) }}
      </p>
      <RecipeListListView
        v-else
        :recipes="archivedRecipes"
        :current-versions="archivedQuery.data.value?.currentVersions ?? []"
        :files="archivedQuery.data.value?.files ?? []"
        :get-recipe-link-props="getRecipeLinkProps"
        grouped
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { listRecipesQuery } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import RecipeListListView from "../../../components/recipes/RecipeListListView.vue";
import { archived_recipes_section as strings } from "./ArchivedRecipesSection.strings.ts";

const props = defineProps<{
  collectionId: string;
  getRecipeLinkProps: (recipeId: string) => { to?: string; href?: string };
}>();

const { t } = useReverseT();
const open = ref(false);

// Only fetched once the section is opened.
const archivedQuery = useQuery(
  computed(() => ({
    ...listRecipesQuery(props.collectionId, { archived: true }),
    enabled: open.value,
  })),
);
const archivedRecipes = computed(() => archivedQuery.data.value?.recipes ?? []);
</script>
