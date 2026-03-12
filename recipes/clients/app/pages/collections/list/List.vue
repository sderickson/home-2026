<template>
  <v-container>
    <v-breadcrumbs class="pl-0 mb-2">
      <v-breadcrumbs-item :to="appLinks.home.path">
        {{ t(strings.breadcrumb_home) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item>
        {{ t(strings.breadcrumb_collections) }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="text-h4">{{ t(strings.title) }}</h1>
      <v-spacer />
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="createDialogOpen = true"
      >
        {{ t(strings.create_collection) }}
      </v-btn>
    </div>
    <p class="text-medium-emphasis mb-4">{{ t(strings.subtitle) }}</p>

    <div v-if="collections.length === 0" class="text-medium-emphasis">
      {{ t(strings.no_collections) }}
    </div>
    <CollectionsTable
      v-else
      :collections="collections"
      @manage-members="openMembersDialog"
    />

    <CreateCollectionDialog
      v-model="createDialogOpen"
      @success="onCollectionCreated"
    />
    <MembersManagementDialog
      v-model="membersDialogOpen"
      :collection-id="selectedCollectionId"
      :collection-name="selectedCollectionName"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { appLinks } from "@sderickson/recipes-links";
import { collections_list as strings } from "./List.strings.ts";
import { useListLoader } from "./List.loader.ts";
import {
  assertCollectionsLoaded,
  assertProfileLoaded,
  getCollectionsList,
} from "./List.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import CollectionsTable from "./CollectionsTable.vue";
import CreateCollectionDialog from "./CreateCollectionDialog.vue";
import MembersManagementDialog from "./MembersManagementDialog.vue";

const { t } = useReverseT();
const { profileQuery, collectionsQuery } = useListLoader();

assertProfileLoaded(profileQuery.data.value);
assertCollectionsLoaded(collectionsQuery.data.value?.collections);

const collections = computed(() =>
  getCollectionsList(collectionsQuery.data.value?.collections),
);

const createDialogOpen = ref(false);
const membersDialogOpen = ref(false);
const selectedCollectionId = ref("");
const selectedCollectionName = ref("");

function openMembersDialog(collection: { id: string; name: string }) {
  selectedCollectionId.value = collection.id;
  selectedCollectionName.value = collection.name;
  membersDialogOpen.value = true;
}

function onCollectionCreated() {
  createDialogOpen.value = false;
}
</script>
