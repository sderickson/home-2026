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
      <v-breadcrumbs-item :to="collectionHomePath">
        {{ collectionName }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item disabled>
        {{ t(strings.breadcrumb_menus) }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="text-h4">{{ collectionName }} — {{ t(strings.title) }}</h1>
      <v-spacer />
      <v-btn
        v-bind="linkToProps(appLinks.menusCreate, { params: { collectionId } })"
        color="primary"
        prepend-icon="mdi-plus"
      >
        {{ t(strings.create_menu) }}
      </v-btn>
    </div>

    <MenusListDisplay :menus="menus" :collection-id="collectionId" />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath, linkToProps } from "@saflib/links";
import { menus_list as strings } from "./List.strings.ts";
import { useListLoader } from "./List.loader.ts";
import { assertMenusListLoaded, getMenusList } from "./List.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import MenusListDisplay from "./MenusListDisplay.vue";

const { t } = useReverseT();
const route = useRoute();
const collectionId = route.params.collectionId as string;
const { collectionQuery, menusQuery } = useListLoader();

assertMenusListLoaded(collectionQuery.data.value, menusQuery.data.value);

const collection = computed(() => collectionQuery.data.value!.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const menus = computed(
  () =>
    getMenusList(menusQuery.data.value) as {
      id: string;
      name: string;
      isPublic: boolean;
    }[],
);

const collectionHomePath = computed(() =>
  constructPath(appLinks.recipesList, { params: { collectionId } }),
);
</script>
