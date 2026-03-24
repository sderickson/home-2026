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
      <v-breadcrumbs-item disabled>
        {{ t(strings.breadcrumb_new) }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <h1 class="text-h4 mb-4">{{ t(strings.title) }}</h1>

    <template v-if="!showForm">
      <p class="mb-4">{{ t(strings.forbidden) }}</p>
      <v-btn
        v-bind="linkToProps(appLinks.collectionsDetail, { params: { collectionId } })"
        color="primary"
      >
        {{ t(strings.breadcrumb_menus) }}
      </v-btn>
    </template>

    <CreateMenuForm v-else :collection-id="collectionId" :recipes="recipes" />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath, linkToProps } from "@saflib/links";
import { menus_create as strings } from "./Create.strings.ts";
import { useCreateLoader } from "./Create.loader.ts";
import { kratosIdentityEmail } from "@sderickson/recipes-sdk";
import { assertCreateDataLoaded, canEditMenuForRole } from "./Create.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import CreateMenuForm from "./CreateMenuForm.vue";

const { t } = useReverseT();
const route = useRoute();
const collectionId = route.params.collectionId as string;
const {
  sessionQuery,
  collectionQuery,
  membersQuery,
  recipesQuery,
} = useCreateLoader();

assertCreateDataLoaded(
  sessionQuery.data.value,
  collectionQuery.data.value,
  membersQuery.data.value,
  recipesQuery.data.value,
);

const collection = computed(() => collectionQuery.data.value!.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => membersQuery.data.value?.members ?? []);
const userEmail = computed(() => kratosIdentityEmail(sessionQuery.data.value) ?? "");
const currentMember = computed(() =>
  members.value.find((m) => m.email === userEmail.value),
);
const showForm = computed(() =>
  canEditMenuForRole(currentMember.value?.role),
);

const recipes = computed(
  () =>
    (recipesQuery.data.value ?? []).map((r) => ({
      id: r.id,
      title: r.title,
    })),
);

const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);
</script>
