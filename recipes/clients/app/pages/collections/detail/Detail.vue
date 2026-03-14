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
      <v-breadcrumbs-item disabled>
        {{ collectionName }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <h1 class="text-h4 mb-4">{{ collectionName }}</h1>

    <div class="d-flex align-center flex-wrap gap-3 mb-4">
      <h2 class="text-h6 mb-0">{{ t(strings.menus_heading) }}</h2>
      <div class="d-flex flex-wrap align-center menus-pills-row">
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
          class="menus-pill"
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
      </div>
      <v-spacer />
    </div>

    <v-divider class="my-4" />

    <div class="d-flex align-center flex-wrap gap-3 mb-3">
      <h2 class="text-h6 mb-0">{{ t(strings.recipes_heading) }}</h2>
      <div v-if="canEdit" class="d-flex flex-wrap align-center recipes-pills-row">
        <v-chip
          variant="tonal"
          color="primary"
          class="action-pill"
          @click="quickImportOpen = true"
        >
          <v-icon size="small">mdi-import</v-icon>
        </v-chip>
        <v-chip
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
      </div>
      <v-spacer />
    </div>
    <RecipeList
      :recipes="recipes"
      :get-recipe-link-props="getRecipeLinkProps"
    />
    <QuickImportDialog
      v-model="quickImportOpen"
      :collection-id="collectionId"
      @success="onQuickImportSuccess"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RecipeList } from "@sderickson/recipes-sdk";
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
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import QuickImportDialog from "../../recipes/list/QuickImportDialog.vue";

const { t } = useReverseT();
const route = useRoute();
const router = useRouter();
const collectionId = route.params.collectionId as string;

const {
  profileQuery,
  collectionQuery,
  membersQuery,
  menusQuery,
  recipesQuery,
} = useDetailLoader();

assertCollectionDetailLoaded(
  profileQuery.data.value,
  collectionQuery.data.value,
  menusQuery.data.value,
  recipesQuery.data.value,
);

const collection = computed(() => collectionQuery.data.value!.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => membersQuery.data.value?.members ?? []);
const userEmail = computed(() => profileQuery.data.value?.email ?? "");
const currentMember = computed(() =>
  members.value.find((m) => m.email === userEmail.value),
);
const canEdit = computed(() =>
  canShowCreateRecipeForRole(currentMember.value?.role),
);

const menus = computed(
  () =>
    getMenusList(menusQuery.data.value) as {
      id: string;
      name: string;
      isPublic: boolean;
    }[],
);
const recipes = computed(() => getRecipesList(recipesQuery.data.value));

const quickImportOpen = ref(false);

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
</style>
