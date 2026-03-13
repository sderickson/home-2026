<template>
  <v-container>
    <v-breadcrumbs class="pl-0 mb-2">
      <v-breadcrumbs-item :to="appLinks.home.path">
        {{ t(strings.breadcrumb_home) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="appLinks.collectionsHome.path">
        {{ t(strings.breadcrumb_collections) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="recipesListPath">
        {{ collectionName }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="text-h4">{{ collectionName }} — {{ t(strings.title) }}</h1>
      <v-spacer />
      <v-btn
        v-if="showCreateRecipe"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-import"
        @click="quickImportOpen = true"
      >
        {{ t(strings.quick_import) }}
      </v-btn>
      <v-btn
        v-if="showCreateRecipe"
        :to="recipesCreatePath"
        color="primary"
        prepend-icon="mdi-plus"
      >
        {{ t(strings.create_recipe) }}
      </v-btn>
    </div>

    <RecipeList :recipes="recipes" :get-recipe-link-props="getRecipeLinkProps" />

    <QuickImportDialog
      v-model="quickImportOpen"
      @success="onQuickImportSuccess"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RecipeList } from "@sderickson/recipes-sdk";
import { appLinks } from "@sderickson/recipes-links";
import { recipes_list_page as strings } from "./List.strings.ts";
import { useListLoader } from "./List.loader.ts";
import {
  assertCollectionLoaded,
  assertProfileLoaded,
  assertRecipesLoaded,
  canShowCreateRecipeForRole,
  getRecipesList,
} from "./List.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import QuickImportDialog from "./QuickImportDialog.vue";

const { t } = useReverseT();
const route = useRoute();
const router = useRouter();
const collectionId = route.params.collectionId as string;
const {
  profileQuery,
  collectionQuery,
  membersQuery,
  recipesQuery,
} = useListLoader();

assertProfileLoaded(profileQuery.data.value);
assertCollectionLoaded(collectionQuery.data.value);
assertRecipesLoaded(recipesQuery.data.value);

const collection = computed(() => collectionQuery.data.value!.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => membersQuery.data.value?.members ?? []);
const userEmail = computed(() => profileQuery.data.value?.email ?? "");
const currentMember = computed(() =>
  members.value.find((m) => m.email === userEmail.value),
);
const showCreateRecipe = computed(() =>
  canShowCreateRecipeForRole(currentMember.value?.role),
);

const recipesListPath = computed(() => `/c/${collectionId}/recipes/list`);
const recipesCreatePath = computed(() => `/c/${collectionId}/recipes/create`);
const recipes = computed(() => getRecipesList(recipesQuery.data.value));
const quickImportOpen = ref(false);

function getRecipeLinkProps(recipeId: string) {
  return { to: `/c/${collectionId}/recipes/${recipeId}` };
}

function onQuickImportSuccess(recipeId: string) {
  router.push(`/c/${collectionId}/recipes/${recipeId}`);
}
</script>
