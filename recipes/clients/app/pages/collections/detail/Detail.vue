<template>
  <div class="collection-page">
    <header class="collection-header">
      <v-breadcrumbs class="mb-3">
        <v-breadcrumbs-item :to="appLinks.home.path">
          {{ t(strings.breadcrumb_home) }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item disabled>
          {{ collectionName }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>

      <div class="d-flex align-center flex-wrap ga-3 mb-md-7">
        <h1 class="collection-title font-title flex-grow-1">
          {{ collectionName }}
        </h1>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-account-group"
          :height="mdAndUp ? 40 : 36"
          :aria-label="
            mdAndUp
              ? undefined
              : t(strings.members_button_label, { count: memberCount })
          "
          @click="membersDialogOpen = true"
        >
          {{ mdAndUp ? membersPillLabel : memberCount }}
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
                rounded="sm"
                size="40"
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
              prepend-icon="mdi-import"
              :title="t(strings.quick_import)"
              @click="quickImportOpen = true"
            />
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
              :disabled="!canDeleteCollection || deleteMutation.isPending.value"
              @click="onDeleteCollection"
            />
          </v-list>
        </v-menu>
      </div>

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
      <h2
        id="menus-heading"
        class="eyebrow mb-2"
        :class="{ 'd-sr-only': !mdAndUp }"
      >
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
      <div
        class="d-flex align-center flex-wrap ga-3 mb-4"
        :class="{ 'd-sr-only': !mdAndUp }"
      >
        <h2 id="recipes-heading" class="recipes-heading font-title">
          {{ t(strings.recipes_heading) }}
          <span class="recipes-count font-mono text-muted">
            ({{ recipes.length }})
          </span>
        </h2>
        <template v-if="mdAndUp">
          <v-text-field
            v-if="recipes.length > 0"
            v-model="recipeSearchQuery"
            :placeholder="t(strings.recipes_search_placeholder)"
            :aria-label="t(strings.recipes_search_label)"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            class="recipes-search mx-2"
          />
          <v-spacer v-else />
          <v-btn
            v-if="canEdit"
            variant="outlined"
            prepend-icon="mdi-import"
            @click="quickImportOpen = true"
          >
            {{ t(strings.quick_import) }}
          </v-btn>
          <v-btn
            v-if="canEdit"
            v-bind="createRecipeLinkProps"
            color="primary"
            prepend-icon="mdi-plus"
          >
            {{ t(strings.create_recipe) }}
          </v-btn>
          <v-btn-toggle
            v-model="recipesView"
            mandatory
            variant="outlined"
            divided
            density="comfortable"
            :aria-label="t(strings.recipes_view_label)"
            role="group"
          >
            <v-btn
              value="grid"
              icon="mdi-view-grid-outline"
              :aria-label="t(strings.recipes_view_switch_grid)"
              :aria-pressed="recipesView === 'grid'"
            />
            <v-btn
              value="list"
              icon="mdi-format-list-bulleted"
              :aria-label="t(strings.recipes_view_switch_list)"
              :aria-pressed="recipesView === 'list'"
            />
          </v-btn-toggle>
        </template>
      </div>

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
        :get-recipe-link-props="getRecipeLinkProps"
      />
      <RecipeListListView
        v-else
        :recipes="filteredRecipes"
        :get-recipe-link-props="getRecipeLinkProps"
        :grouped="!mdAndUp && !isSearching"
      />
    </section>

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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
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

/** Same queries as RecipeList — shared cache so ingredients are not fetched twice. */
const recipeDetailQueries = useQueries({
  queries: computed(() => recipes.value.map((r) => getRecipeQuery(r.id))),
});

const filteredRecipes = computed(() => {
  const list = recipes.value;
  const q = (recipeSearchQuery.value ?? "").trim().toLowerCase();
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
/** Desktop only; phones always show rows. */
const recipesView = ref<"grid" | "list">("grid");

const memberCount = computed(() => members.value.length);
const membersPillLabel = computed(() =>
  memberCount.value === 1
    ? t(strings.members_pill_one)
    : `${memberCount.value} ${t(strings.members_pill_plural)}`,
);

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
.collection-page {
  max-width: 1160px;
  margin: 0 auto;
  padding-bottom: 48px;
}

.collection-title {
  margin: 0;
  font-weight: 600;
  font-size: 44px;
  line-height: 1.05;
}

.menus-section {
  margin-bottom: 36px;
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

.recipes-search {
  flex: 1 1 280px;
}

/* Phones: header block on white, tabs scroll sideways on one row. */
@media (max-width: 959.98px) {
  .collection-header {
    margin: -16px -16px 0;
    padding: 12px 16px 12px;
    background: rgb(var(--v-theme-surface));
    border-bottom: 1px solid rgb(var(--v-theme-outline-soft));
  }

  .collection-title {
    font-size: 32px;
    line-height: 1.1;
  }

  .menus-section {
    margin: 0 -16px 8px;
    padding: 14px 16px 0;
  }

  .menu-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-left: 0;
  }

  .menu-tab.v-btn {
    flex-shrink: 0;
    height: 44px;
  }
}
</style>
