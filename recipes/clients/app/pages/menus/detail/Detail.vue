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
      <v-breadcrumbs-item :to="menusListPath">
        {{ collectionName }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="menusListPath">
        {{ t(strings.breadcrumb_menus) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item disabled>
        {{ menu.name }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="text-h4">{{ menu.name }}</h1>
      <v-chip size="small" :color="menu.isPublic ? 'success' : 'default'">
        {{ menu.isPublic ? t(strings.public) : t(strings.private) }}
      </v-chip>
      <v-btn-toggle
        v-model="viewMode"
        mandatory
        density="compact"
        variant="outlined"
        class="ml-2"
      >
        <v-btn value="menu" size="small">
          {{ t(strings.view_mode_menu) }}
        </v-btn>
        <v-btn value="diner" size="small">
          {{ t(strings.view_mode_diner) }}
        </v-btn>
      </v-btn-toggle>
      <v-spacer />
      <template v-if="showEdit">
        <v-btn
          v-if="!isEditing"
          variant="outlined"
          prepend-icon="mdi-pencil"
          @click="startEdit"
        >
          {{ t(strings.edit) }}
        </v-btn>
        <template v-else>
          <v-btn variant="outlined" @click="cancelEdit">
            {{ t(strings.cancel) }}
          </v-btn>
        </template>
        <v-btn
          v-if="!isEditing"
          variant="text"
          color="error"
          prepend-icon="mdi-delete"
          @click="deleteDialogOpen = true"
        >
          {{ t(strings.delete) }}
        </v-btn>
      </template>
    </div>

    <MenuGroupingsDisplay
      v-if="!isEditing"
      :groupings="menu.groupings"
      :recipes="menuRecipesForDisplay"
      :menu-id="menuId"
      :collection-id="collectionId"
      :view-mode="viewMode"
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

const menusListPath = computed(() =>
  constructPath(appLinks.menusList, { params: { collectionId } }),
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
