<template>
  <v-container>
    <v-breadcrumbs class="pl-0 mb-2">
      <v-breadcrumbs-item :to="appLinks.home.path">
        {{ t(strings.breadcrumb_home) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item disabled>
        {{ collectionName }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <div class="d-flex align-center flex-wrap gap-3 mb-0">
      <h1 class="text-h4 mb-0">
        {{ collectionName }}

        <v-chip
          variant="tonal"
          color="primary"
          class="action-pill collection-members-pill mr-2"
          @click="membersDialogOpen = true"
        >
          <v-icon size="small">mdi-account-group</v-icon>
          <span class="ml-1">{{ membersPillLabel }}</span>
        </v-chip>
        <v-tooltip
          v-if="isOwner"
          :text="
            canDeleteCollection
              ? t(strings.delete_collection_tooltip_empty)
              : t(strings.delete_collection_tooltip_disabled)
          "
          location="bottom"
        >
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps" class="d-inline-block">
              <v-chip
                variant="outlined"
                color="error"
                :disabled="!canDeleteCollection"
                :loading="deleteMutation.isPending.value"
                @click="onDeleteCollection"
              >
                <v-icon size="small">mdi-delete-outline</v-icon>
              </v-chip>
            </span>
          </template>
        </v-tooltip>
      </h1>
    </div>

    <v-divider class="my-4" />

    <div class="d-flex align-center flex-wrap gap-3 mb-4">
      <h2 class="text-h6 mb-0">
        {{ t(strings.menus_heading) }}

        <v-chip
          v-for="menu in menus"
          :key="menu.id"
          :to="
            constructPath(appLinks.menusDetail, {
              params: { collectionId, id: menu.id },
            })
          "
          variant="tonal"
          color="primary"
          class="menus-pill mr-2"
          link
        >
          {{ menu.name }}
        </v-chip>
        <v-chip
          v-if="canEdit"
          v-bind="
            linkToProps(appLinks.menusCreate, { params: { collectionId } })
          "
          variant="tonal"
          color="primary"
          class="menus-pill menus-pill-add"
          link
        >
          <v-icon size="small">mdi-plus</v-icon>
        </v-chip>
      </h2>
      <div class="d-flex flex-wrap align-center menus-pills-row"></div>
      <v-spacer />
    </div>

    <v-divider class="my-4" />

    <div class="d-flex align-center flex-wrap gap-3 mb-3">
      <h2 class="text-h6 mb-0">
        {{ t(strings.recipes_heading) }}

        <v-chip
          v-if="canEdit"
          variant="tonal"
          color="primary"
          class="action-pill mr-2"
          @click="quickImportOpen = true"
        >
          <v-icon size="small">mdi-import</v-icon>
        </v-chip>
        <v-chip
          v-if="canEdit"
          v-bind="
            linkToProps(appLinks.recipesCreate, { params: { collectionId } })
          "
          variant="tonal"
          color="primary"
          class="action-pill"
          link
        >
          <v-icon size="small">mdi-plus</v-icon>
        </v-chip>
      </h2>
    </div>
    <v-text-field
      v-if="recipes.length > 0"
      v-model="recipeSearchQuery"
      :placeholder="t(strings.recipes_search_placeholder)"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="comfortable"
      hide-details="auto"
      clearable
      class="mb-4"
    />
    <div v-if="recipes.length > 0 && filteredRecipes.length === 0" class="py-4">
      <v-alert type="info" variant="tonal">
        {{ t(strings.recipes_search_no_match) }}
      </v-alert>
    </div>
    <RecipeList
      v-else
      :recipes="filteredRecipes"
      :get-recipe-link-props="getRecipeLinkProps"
    />
    <QuickImportDialog
      v-model="quickImportOpen"
      :collection-id="collectionId"
      @success="onQuickImportSuccess"
    />
    <MembersManagementDialog
      v-model="membersDialogOpen"
      :collection-id="collectionId"
      :collection-name="collectionName"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQueries } from "@tanstack/vue-query";
import type { Recipe } from "@sderickson/recipes-spec";
import {
  getRecipeQuery,
  RecipeList,
  recipeDetailIngredientsSearchText,
  useDeleteCollectionsMutation,
} from "@sderickson/recipes-sdk";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath, linkToProps } from "@saflib/links";
import { collections_detail as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertCollectionDetailLoaded,
  canShowCreateRecipeForRole,
  getMenusList,
  getRecipesList,
} from "./Detail.logic.ts";
import { kratosEmailFromSession } from "@saflib/ory-kratos-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import MembersManagementDialog from "../../../components/collections/MembersManagementDialog.vue";
import QuickImportDialog from "../../../components/quick-import/QuickImportDialog.vue";

const { t } = useReverseT();
const route = useRoute();
const router = useRouter();
const collectionId = route.params.collectionId as string;

const {
  sessionQuery,
  collectionQuery,
  membersQuery,
  menusQuery,
  recipesQuery,
} = useDetailLoader();

assertCollectionDetailLoaded(
  sessionQuery.data.value,
  collectionQuery.data.value,
  menusQuery.data.value,
  recipesQuery.data.value,
);

const collection = computed(() => collectionQuery.data.value!.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => membersQuery.data.value?.members ?? []);
const userEmail = computed(
  () => kratosEmailFromSession(sessionQuery.data.value) ?? "",
);
const currentMember = computed(() =>
  members.value.find((m) => m.email === userEmail.value),
);
const canEdit = computed(() =>
  canShowCreateRecipeForRole(currentMember.value?.role),
);
const isOwner = computed(() => currentMember.value?.role === "owner");
const canDeleteCollection = computed(
  () => recipes.value.length === 0 && menus.value.length === 0,
);

const deleteMutation = useDeleteCollectionsMutation();

const menus = computed(
  () =>
    getMenusList(menusQuery.data.value) as {
      id: string;
      name: string;
    }[],
);
const recipes = computed(
  () => getRecipesList(recipesQuery.data.value) as Recipe[],
);

const recipeSearchQuery = ref("");

/** Same queries as RecipeList — shared cache so ingredients are not fetched twice. */
const recipeDetailQueries = useQueries({
  queries: computed(() =>
    recipes.value.map((r) => getRecipeQuery(r.id)),
  ),
});

const filteredRecipes = computed(() => {
  const list = recipes.value;
  const q = recipeSearchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((r, i) => {
    const text = [r.title, r.subtitle, r.description ?? ""]
      .join(" ")
      .toLowerCase();
    if (text.includes(q)) return true;
    const detail = recipeDetailQueries.value[i]?.data;
    if (!detail) return false;
    return recipeDetailIngredientsSearchText(detail).includes(q);
  });
});

const quickImportOpen = ref(false);
const membersDialogOpen = ref(false);

const memberCount = computed(() => members.value.length);
const membersPillLabel = computed(() =>
  memberCount.value === 1
    ? t(strings.members_pill_one)
    : `${memberCount.value} ${t(strings.members_pill_plural)}`,
);

function getRecipeLinkProps(recipeId: string) {
  return linkToProps(appLinks.recipesDetail, {
    params: { collectionId, id: recipeId },
  });
}

function onQuickImportSuccess(recipeId: string) {
  router.push(
    constructPath(appLinks.recipesDetail, {
      params: { collectionId, id: recipeId },
    }),
  );
}

async function onDeleteCollection() {
  if (!canDeleteCollection.value) return;
  try {
    await deleteMutation.mutateAsync(collectionId);
    router.push(appLinks.home.path);
  } catch {
    // Error handled by mutation / global snackbar if configured
  }
}
</script>

<style scoped>
.menus-pills-row,
.recipes-pills-row {
  gap: 0.75rem;
  margin-left: 0.75rem;
}
.menus-pill,
.action-pill {
  font-size: 0.9375rem;
  padding: 0.5rem 0.875rem;
}
.action-pill {
  cursor: pointer;
}
.collection-members-pill {
  margin-left: 0.75rem;
}
</style>
