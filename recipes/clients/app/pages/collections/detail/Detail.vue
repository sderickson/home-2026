<template>
  <v-container
    fluid
    max-width="1160"
    class="collection-page pa-0"
    :class="{ 'collection-page--phone': !mdAndUp }"
  >
    <header class="collection-header">
      <v-row align="center" dense class="mb-md-5">
        <v-col>
          <h1 class="collection-title font-title">
            {{ collectionName }}
          </h1>
        </v-col>
        <v-col cols="auto" class="d-flex align-center ga-2">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-account-group"
            :aria-label="
              t(strings.members_button_label, { count: memberCount })
            "
            @click="membersDialogOpen = true"
          >
            {{ memberCount }}
          </v-btn>

          <!-- Desktop: delete collection (owner only) -->
          <v-tooltip
            v-if="isOwner && mdAndUp"
            :text="deleteCollectionTooltip"
            location="bottom"
          >
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps" class="d-inline-block">
                <v-btn
                  icon="mdi-delete-outline"
                  variant="outlined"
                  size="44"
                  color="muted"
                  :aria-label="t(strings.delete_collection)"
                  :disabled="!canDeleteCollection"
                  :loading="deleteMutation.isPending.value"
                  @click="onDeleteCollection"
                />
              </span>
            </template>
          </v-tooltip>

          <!-- Phone: authoring actions live in an overflow menu -->
          <v-menu v-if="!mdAndUp && (canEdit || isOwner)" location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="mdi-dots-vertical"
                variant="text"
                :aria-label="t(strings.more_actions)"
              />
            </template>
            <v-list density="comfortable">
              <v-list-item
                v-if="canEdit"
                v-bind="createRecipeLinkProps"
                prepend-icon="mdi-plus"
                :title="t(strings.create_recipe)"
              />
              <v-list-item
                v-if="isOwner"
                prepend-icon="mdi-delete-outline"
                base-color="error"
                :title="t(strings.delete_collection)"
                :subtitle="
                  canDeleteCollection ? undefined : deleteCollectionTooltip
                "
                :disabled="
                  !canDeleteCollection || deleteMutation.isPending.value
                "
                @click="onDeleteCollection"
              />
            </v-list>
          </v-menu>
        </v-col>
      </v-row>

      <v-text-field
        v-if="!mdAndUp && recipes.length > 0"
        v-model="recipeSearchQuery"
        :placeholder="t(strings.recipes_search_placeholder)"
        :aria-label="t(strings.recipes_search_label)"
        prepend-inner-icon="mdi-magnify"
        bg-color="surface-tab"
        density="default"
        hide-details
        clearable
        class="mt-2"
      />
    </header>

    <!-- Menus as recipe-box divider tabs -->
    <section
      v-if="menus.length > 0 || canEdit"
      aria-labelledby="menus-heading"
      class="menus-section"
    >
      <h2 id="menus-heading" class="d-sr-only">
        {{ t(strings.menus_heading) }}
      </h2>
      <nav class="menu-tabs" aria-labelledby="menus-heading">
        <v-btn
          v-for="menu in menus"
          :key="menu.id"
          :to="
            constructPath(appLinks.menusDetail, {
              params: { collectionId, id: menu.id },
            })
          "
          color="surface-tab"
          class="menu-tab menus-pill"
        >
          {{ menu.name }}
        </v-btn>
        <v-btn
          v-if="canEdit"
          v-bind="
            linkToProps(appLinks.menusCreate, { params: { collectionId } })
          "
          variant="outlined"
          color="primary"
          class="menu-tab menu-tab--add menus-pill-add"
          :aria-label="t(strings.create_menu)"
        >
          <v-icon size="small">mdi-plus</v-icon>
        </v-btn>
      </nav>
    </section>

    <section aria-labelledby="recipes-heading">
      <v-row
        align="center"
        dense
        class="mb-3"
        :class="{ 'd-sr-only': !mdAndUp }"
      >
        <v-col cols="auto" class="pe-4">
          <h2 id="recipes-heading" class="recipes-heading font-title">
            {{ t(strings.recipes_heading) }}
            <span class="recipes-count font-mono text-muted">
              ({{ recipes.length }})
            </span>
          </h2>
        </v-col>
        <template v-if="mdAndUp">
          <v-col>
            <v-text-field
              v-if="recipes.length > 0"
              v-model="recipeSearchQuery"
              :placeholder="t(strings.recipes_search_placeholder)"
              :aria-label="t(strings.recipes_search_label)"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="auto" class="d-flex ga-2">
            <!-- Shows the current layout; click to switch to the other -->
            <v-tooltip :text="recipesViewToggleLabel" location="bottom">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  :icon="
                    recipesView === 'grid'
                      ? 'mdi-view-grid-outline'
                      : 'mdi-format-list-bulleted'
                  "
                  variant="outlined"
                  size="44"
                  :aria-label="recipesViewToggleLabel"
                  @click="toggleRecipesView"
                />
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="canEdit"
              :text="t(strings.create_recipe)"
              location="bottom"
            >
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="{ ...tooltipProps, ...createRecipeLinkProps }"
                  icon="mdi-plus"
                  color="primary"
                  size="44"
                  :aria-label="t(strings.create_recipe)"
                />
              </template>
            </v-tooltip>
          </v-col>
        </template>
      </v-row>

      <div
        v-if="recipes.length > 0 && filteredRecipes.length === 0"
        class="py-4"
      >
        <v-alert type="info" variant="tonal">
          {{ t(strings.recipes_search_no_match) }}
        </v-alert>
      </div>
      <RecipeList
        v-else-if="mdAndUp && recipesView === 'grid'"
        :recipes="filteredRecipes"
        :current-versions="currentVersions"
        :files="recipeFiles"
        :get-recipe-link-props="getRecipeLinkProps"
      />
      <RecipeListListView
        v-else
        :recipes="filteredRecipes"
        :current-versions="currentVersions"
        :files="recipeFiles"
        :get-recipe-link-props="getRecipeLinkProps"
        :grouped="!isSearching"
      />
    </section>

    <ArchivedRecipesSection
      :collection-id="collectionId"
      :get-recipe-link-props="getRecipeLinkProps"
    />

    <MembersManagementDialog
      v-model="membersDialogOpen"
      :collection-id="collectionId"
      :collection-name="collectionName"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@sderickson/recipes-clients-common";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import type { Recipe } from "@sderickson/recipes-spec";
import {
  RecipeList,
  recipeDetailIngredientsSearchText,
  useDeleteCollectionsMutation,
} from "@sderickson/recipes-sdk";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath, linkToProps } from "@saflib/links";
import { collections_detail as strings } from "./Detail.strings.ts";
import ArchivedRecipesSection from "./ArchivedRecipesSection.vue";
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
import RecipeListListView from "../../../components/recipes/RecipeListListView.vue";

const { t } = useReverseT();
const { mdAndUp } = useDisplay();
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
const isSearching = computed(
  () => (recipeSearchQuery.value ?? "").trim().length > 0,
);

const currentVersions = computed(
  () => recipesQuery.data.value?.currentVersions ?? [],
);
const recipeFiles = computed(() => recipesQuery.data.value?.files ?? []);
const currentVersionByRecipeId = computed(
  () => new Map(currentVersions.value.map((v) => [v.recipeId, v])),
);

const filteredRecipes = computed(() => {
  const list = recipes.value;
  const q = (recipeSearchQuery.value ?? "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((r) => {
    const text = [r.title, r.subtitle, r.description ?? ""]
      .join(" ")
      .toLowerCase();
    if (text.includes(q)) return true;
    const currentVersion = currentVersionByRecipeId.value.get(r.id);
    return recipeDetailIngredientsSearchText({ currentVersion }).includes(q);
  });
});

const membersDialogOpen = ref(false);
/** Desktop only; phones always show rows. */
const recipesView = ref<"grid" | "list">("grid");
const recipesViewToggleLabel = computed(() =>
  recipesView.value === "grid"
    ? t(strings.recipes_view_switch_to_list)
    : t(strings.recipes_view_switch_to_grid),
);

function toggleRecipesView() {
  recipesView.value = recipesView.value === "grid" ? "list" : "grid";
}

const memberCount = computed(() => members.value.length);

const deleteCollectionTooltip = computed(() =>
  canDeleteCollection.value
    ? t(strings.delete_collection_tooltip_empty)
    : t(strings.delete_collection_tooltip_disabled),
);

const createRecipeLinkProps = computed(() =>
  linkToProps(appLinks.recipesCreate, { params: { collectionId } }),
);

function getRecipeLinkProps(recipeId: string) {
  return linkToProps(appLinks.recipesDetail, {
    params: { collectionId, id: recipeId },
  });
}

async function onDeleteCollection() {
  if (!canDeleteCollection.value) return;
  try {
    await deleteMutation.mutateAsync(collectionId);
    router.push(appLinks.home.path);
  } catch {
    // The global mutation error handler shows it in the snackbar.
  }
}

useBreadcrumbs(() => [{ title: collectionName.value }]);
</script>

<style scoped>
.collection-page {
  padding-bottom: 48px !important;
}

.collection-title {
  margin: 0;
  font-weight: 600;
  font-size: 44px;
  line-height: 1.05;
}

.menus-section {
  margin-bottom: 28px;
}

/* Divider tabs with rounded tops, sitting on a 2px baseline. */
.menu-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 6px;
  padding-left: 12px;
  border-bottom: 2px solid rgb(var(--v-theme-outline));
}

.menu-tab.v-btn {
  height: 40px;
  margin-bottom: -2px;
  padding: 0 18px;
  border: 1px solid rgb(var(--v-theme-outline));
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  box-shadow: inset 0 -2px 0 rgb(var(--v-theme-outline));
  font-size: 15px;
}

.menu-tab--add.v-btn {
  min-width: 44px;
  width: 44px;
  padding: 0;
  border-style: dashed;
  border-color: #a8a091;
  box-shadow: none;
}

.recipes-heading {
  margin: 0;
  font-weight: 600;
  font-size: 26px;
}

.recipes-count {
  font-size: 15px;
  font-weight: 400;
}

/* Phones (below Vuetify's md, via useDisplay so it switches with the app bar):
 * header block on white, tabs scroll sideways on one row. */
.collection-page--phone .collection-header {
  margin: -16px -16px 0;
  padding: 12px 16px 12px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-soft));
}

.collection-page--phone .collection-title {
  font-size: 32px;
  line-height: 1.1;
}

.collection-page--phone .menus-section {
  margin: 0 -16px 8px;
  padding: 14px 16px 0;
}

.collection-page--phone .menu-tabs {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-left: 0;
}

.collection-page--phone .menu-tab.v-btn {
  flex-shrink: 0;
  height: 44px;
}
</style>
