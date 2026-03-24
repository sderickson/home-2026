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
      <h1 class="text-h4 mb-0">{{ collectionName }}</h1>
      <v-chip
        variant="tonal"
        color="primary"
        class="action-pill collection-members-pill"
        @click="membersDialogOpen = true"
      >
        <v-icon size="small">mdi-account-group</v-icon>
        <span class="ml-1">{{ membersPillLabel }}</span>
      </v-chip>
      <v-spacer />
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
            <v-btn
              icon="mdi-delete-outline"
              variant="outlined"
              color="error"
              :disabled="!canDeleteCollection"
              :loading="deleteMutation.isPending.value"
              @click="onDeleteCollection"
            />
          </span>
        </template>
      </v-tooltip>
    </div>

    <v-divider class="my-4" />

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
import { RecipeList, useDeleteCollectionsMutation } from "@sderickson/recipes-sdk";
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
import { kratosIdentityEmail } from "@sderickson/recipes-sdk";
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
const userEmail = computed(() => kratosIdentityEmail(sessionQuery.data.value) ?? "");
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
const recipes = computed(() => getRecipesList(recipesQuery.data.value));

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
