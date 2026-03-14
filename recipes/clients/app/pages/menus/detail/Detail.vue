<template>
  <v-container>
    <v-breadcrumbs class="pl-0 mb-2">
      <v-breadcrumbs-item :to="appLinks.home.path">
        {{ t(strings.breadcrumb_home) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="collectionDetailPath">
        {{ collectionName }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="collectionDetailPath">
        {{ t(strings.breadcrumb_menus) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item disabled>
        {{ menu.name }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <v-toolbar density="comfortable" class="mb-4">
      <v-toolbar-title v-if="isEditing" class="text-h6">
        {{ menu.name }}
      </v-toolbar-title>
      <template v-if="!isEditing">
        <v-tooltip location="bottom" :text="t(strings.tooltip_menu_view)">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              variant="text"
              :class="{ 'v-btn--active': viewMode === 'menu' }"
              @click="viewMode = 'menu'"
            >
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip location="bottom" :text="t(strings.tooltip_diner_view)">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              variant="text"
              :class="{ 'v-btn--active': viewMode === 'diner' }"
              @click="viewMode = 'diner'"
            >
              <v-icon>mdi-view-module</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
      <v-spacer />
      <v-chip
        v-if="!isEditing"
        size="small"
        density="compact"
        :color="menu.isPublic ? 'success' : 'default'"
      >
        {{ menu.isPublic ? t(strings.public) : t(strings.private) }}
      </v-chip>
      <template v-if="showEdit">
        <v-tooltip v-if="!isEditing" location="bottom" :text="t(strings.edit)">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              variant="text"
              @click="startEdit"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <template v-else>
          <v-tooltip location="bottom" :text="t(strings.cancel)">
            <template #activator="{ props: tooltipProps }">
              <v-btn v-bind="tooltipProps" icon variant="text" @click="cancelEdit">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
        <v-tooltip
          v-if="!isEditing"
          location="bottom"
          :text="t(strings.delete)"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              variant="text"
              color="error"
              @click="deleteDialogOpen = true"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-toolbar>

    <MenuGroupingsDisplay
      v-if="!isEditing"
      :groupings="menu.groupings"
      :recipes="menuRecipesForDisplay"
      :menu-id="menuId"
      :collection-id="collectionId"
      :view-mode="viewMode"
      :menu-title="!isEditing ? menu.name : undefined"
    />
    <MenuEditForm
      v-else
      :form="editForm"
      :recipes="recipesList"
      :menu-id="menuId"
      :collection-id="collectionId"
      @saved="isEditing = false"
      @add-grouping="addGrouping"
      @remove-grouping="removeGrouping"
    />

    <DeleteMenuDialog
      v-model="deleteDialogOpen"
      :menu-id="menuId"
      :collection-id="collectionId"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { menus_detail as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertMenuDetailLoaded,
  canEditMenuForRole,
  type MenuEditFormModel,
} from "./Detail.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import MenuGroupingsDisplay from "./MenuGroupingsDisplay.vue";
import MenuEditForm from "./MenuEditForm.vue";
import DeleteMenuDialog from "./DeleteMenuDialog.vue";

const { t } = useReverseT();
const route = useRoute();
const collectionId = route.params.collectionId as string;
const menuId = route.params.id as string;
const {
  profileQuery,
  collectionQuery,
  membersQuery,
  menuQuery,
  recipesQuery,
} = useDetailLoader();

assertMenuDetailLoaded(
  profileQuery.data.value,
  collectionQuery.data.value,
  membersQuery.data.value,
  menuQuery.data.value,
  recipesQuery.data.value,
);

const collection = computed(() => collectionQuery.data.value!.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => membersQuery.data.value?.members ?? []);
const userEmail = computed(() => profileQuery.data.value?.email ?? "");
const currentMember = computed(() =>
  members.value.find((m) => m.email === userEmail.value),
);
const showEdit = computed(() =>
  canEditMenuForRole(currentMember.value?.role),
);

const menuData = computed(() => menuQuery.data.value!);
const menu = computed(() => menuData.value.menu);
const menuRecipes = computed(() => menuData.value.recipes ?? []);

const menuRecipesForDisplay = computed(() =>
  menuRecipes.value.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle ?? "",
  })),
);

const recipesList = computed(
  () =>
    (recipesQuery.data.value ?? []).map((r) => ({
      id: r.id,
      title: r.title,
    })),
);

const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);

const viewMode = ref<"menu" | "diner">("menu");
const isEditing = ref(false);
const deleteDialogOpen = ref(false);

const editForm = reactive<MenuEditFormModel>({
  name: "",
  isPublic: false,
  groupings: [],
});

function syncEditFormFromMenu() {
  editForm.name = menu.value.name;
  editForm.isPublic = menu.value.isPublic;
  editForm.groupings = menu.value.groupings.map((g) => ({
    name: g.name,
    recipeIds: [...g.recipeIds],
  }));
}

watch(
  () => menu.value,
  (m) => {
    if (m) syncEditFormFromMenu();
  },
  { immediate: true },
);

function startEdit() {
  syncEditFormFromMenu();
  isEditing.value = true;
}

function addGrouping() {
  editForm.groupings.push({ name: "", recipeIds: [] });
}

function removeGrouping(index: number) {
  editForm.groupings.splice(index, 1);
}

function cancelEdit() {
  syncEditFormFromMenu();
  isEditing.value = false;
}
</script>
