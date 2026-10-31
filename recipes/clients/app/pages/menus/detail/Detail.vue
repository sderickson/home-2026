<template>
  <v-container max-width="1240" class="menu-page pa-0">
    <div v-if="!isEditing" class="menu-page__bar d-print-none">
      <MenuViewToggle v-model="viewMode" :block="!mdAndUp" />

      <div v-if="mdAndUp" class="d-flex ga-2">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-link-variant"
          class="bg-surface"
          @click="copyShareLink"
        >
          {{ t(strings.get_share_link) }}
        </v-btn>
        <template v-if="showEdit">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-pencil-outline"
            class="bg-surface"
            @click="startEdit"
          >
            {{ t(strings.edit) }}
          </v-btn>
          <v-btn
            variant="outlined"
            icon="mdi-delete-outline"
            color="error"
            size="40"
            rounded="sm"
            :aria-label="t(strings.delete)"
            @click="deleteDialogOpen = true"
          />
        </template>
      </div>
      <!-- Phones: actions live in an overflow menu in the app bar. -->
      <Teleport v-else defer to="#app-bar-page-actions">
        <v-menu location="bottom end">
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
              prepend-icon="mdi-link-variant"
              :title="t(strings.get_share_link)"
              @click="copyShareLink"
            />
            <template v-if="showEdit">
              <v-list-item
                prepend-icon="mdi-pencil-outline"
                :title="t(strings.edit)"
                @click="startEdit"
              />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                base-color="error"
                :title="t(strings.delete)"
                @click="deleteDialogOpen = true"
              />
            </template>
          </v-list>
        </v-menu>
      </Teleport>
    </div>

    <MenuGroupingsDisplay
      v-if="!isEditing"
      :groupings="menu.groupings"
      :recipes="menuRecipesForDisplay"
      :current-versions="menuData.currentVersions"
      :files="menuData.files"
      :menu-id="menuId"
      :collection-id="collectionId"
      :view-mode="viewMode"
      :menu-title="menu.name"
      :collection-name="collectionName"
    />
    <MenuEditForm
      v-else
      :form="editForm"
      :recipes="recipesList"
      :menu-id="menuId"
      :collection-id="collectionId"
      @saved="isEditing = false"
      @cancel="cancelEdit"
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
import { useBreadcrumbs } from "@sderickson/recipes-clients-common";
import { computed, ref, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath, linkToHrefWithHost } from "@saflib/links";
import { showInfo } from "@saflib/vue";
import { menus_detail as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertMenuDetailLoaded,
  canEditMenuForRole,
  type MenuEditFormModel,
} from "./Detail.logic.ts";
import { kratosEmailFromSession } from "@saflib/ory-kratos-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import MenuGroupingsDisplay from "./MenuGroupingsDisplay.vue";
import MenuViewToggle from "./MenuViewToggle.vue";
import MenuEditForm from "./MenuEditForm.vue";
import DeleteMenuDialog from "./DeleteMenuDialog.vue";

const { t } = useReverseT();
const route = useRoute();
const { mdAndUp } = useDisplay();
const collectionId = route.params.collectionId as string;
const menuId = route.params.id as string;
const { sessionQuery, collectionQuery, membersQuery, menuQuery, recipesQuery } =
  useDetailLoader();

assertMenuDetailLoaded(
  sessionQuery.data.value,
  collectionQuery.data.value,
  membersQuery.data.value,
  menuQuery.data.value,
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
const showEdit = computed(() => canEditMenuForRole(currentMember.value?.role));

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

const recipesList = computed(() =>
  (recipesQuery.data.value?.recipes ?? []).map((r) => ({
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
  groupings: [],
});

function syncEditFormFromMenu() {
  editForm.name = menu.value.name;
  editForm.groupings = menu.value.groupings.map((g, i) => ({
    name: g.name,
    recipeIds: [...g.recipeIds],
    _uid: Date.now() + i,
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
  editForm.groupings.push({
    name: "",
    recipeIds: [],
    _uid: Date.now(),
  });
}

function removeGrouping(index: number) {
  editForm.groupings.splice(index, 1);
}

async function copyShareLink() {
  const href = linkToHrefWithHost(appLinks.shareMenus, {
    params: { id: menuId },
  });
  await navigator.clipboard.writeText(href);
  showInfo(t(strings.link_copied));
}

function cancelEdit() {
  syncEditFormFromMenu();
  isEditing.value = false;
}

useBreadcrumbs(() => [
  { title: collectionName.value, to: collectionDetailPath.value },
  { title: menu.value.name },
]);
</script>

<style scoped>
.menu-page {
  padding-bottom: 48px !important;
}

.menu-page__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

@media print {
  .menu-page__bar {
    display: none !important;
  }
}
</style>
