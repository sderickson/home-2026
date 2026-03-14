<template>
  <v-container>
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
      :members="members"
      :user-email="userEmail"
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
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import {
  assertCollectionsLoaded,
  assertProfileLoaded,
  getCollectionsList,
} from "../collections/list/List.logic.ts";
import CollectionsTable from "../collections/list/CollectionsTable.vue";
import CreateCollectionDialog from "../collections/list/CreateCollectionDialog.vue";
import MembersManagementDialog from "../collections/list/MembersManagementDialog.vue";

const { t } = useReverseT();
const { profileQuery, collectionsQuery } = useHomeLoader();

assertProfileLoaded(profileQuery.data.value);
assertCollectionsLoaded(collectionsQuery.data.value?.collections);

const collections = computed(() =>
  getCollectionsList(collectionsQuery.data.value?.collections),
);
const members = computed(
  () => collectionsQuery.data.value?.members ?? [],
);
const userEmail = computed(
  () => profileQuery.data.value?.email ?? "",
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
