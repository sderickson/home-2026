<template>
  <v-container>
    <v-alert
      type="info"
      variant="tonal"
      class="mb-6"
      v-if="!collections.length"
    >
      <v-alert-title>{{ t(strings.welcome_heading) }}</v-alert-title>
      <p class="mb-2">{{ t(strings.welcome_intro) }}</p>
    </v-alert>

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
    <div v-else class="d-flex flex-column gap-4">
      <v-card
        v-for="collection in collections"
        :key="collection.id"
        class="collection-card"
        elevation="2"
      >
        <v-card-title class="collection-card-title text-h5 font-weight-medium">
          {{ collection.name }}
        </v-card-title>
        <v-card-text class="collection-card-body">
          <div
            v-if="otherMemberEmailsForCollection(collection.id).length > 0"
            class="mb-4"
          >
            <span class="text-caption text-medium-emphasis"
              >{{ t(strings.members) }}:
            </span>
            <span class="text-body-2">{{
              otherMemberEmailsForCollection(collection.id)
            }}</span>
          </div>
          <div class="d-flex flex-wrap align-center gap-2 menu-pills">
            Menus:
            <v-chip
              v-for="menu in menusForCollection(collection.id)"
              :key="menu.id"
              :to="menuDetailPath(collection.id, menu.id)"
              variant="tonal"
              color="primary"
              size="default"
              class="menu-pill"
              link
            >
              {{ menu.name }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions class="collection-card-actions">
          <v-btn
            block
            size="x-large"
            color="primary"
            variant="flat"
            :to="collectionDetailPath(collection.id)"
          >
            {{ t(strings.see_all_recipes) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <CreateCollectionDialog
      v-model="createDialogOpen"
      @success="onCollectionCreated"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { constructPath } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import {
  assertKratosSessionIdentityLoaded,
  kratosEmailFromSession,
} from "@saflib/ory-kratos-sdk";
import { assertCollectionsLoaded, getCollectionsList } from "./Home.logic.ts";
import CreateCollectionDialog from "../../components/collections/CreateCollectionDialog.vue";

const { t } = useReverseT();
const { sessionQuery, collectionsQuery } = useHomeLoader();

assertKratosSessionIdentityLoaded(sessionQuery.data.value);
assertCollectionsLoaded(collectionsQuery.data.value?.collections);

const collections = computed(() =>
  getCollectionsList(collectionsQuery.data.value?.collections),
);
const members = computed(() => collectionsQuery.data.value?.members ?? []);
const menus = computed(() => collectionsQuery.data.value?.menus ?? []);
const userEmail = computed(
  () => kratosEmailFromSession(sessionQuery.data.value) ?? "",
);

function membersForCollection(collectionId: string) {
  return members.value.filter((m) => m.collectionId === collectionId);
}

function otherMemberEmailsForCollection(collectionId: string): string {
  return membersForCollection(collectionId)
    .filter((m) => m.email !== userEmail.value)
    .map((m) => m.email)
    .join(", ");
}

function menusForCollection(collectionId: string) {
  return menus.value.filter((m) => m.collectionId === collectionId);
}

function collectionDetailPath(collectionId: string) {
  return constructPath(appLinks.collectionsDetail, {
    params: { collectionId },
  });
}

function menuDetailPath(collectionId: string, menuId: string) {
  return constructPath(appLinks.menusDetail, {
    params: { collectionId, id: menuId },
  });
}

const createDialogOpen = ref(false);

function onCollectionCreated() {
  createDialogOpen.value = false;
}
</script>

<style scoped>
.collection-card {
  width: 100%;
}
.collection-card-title {
  padding: 1.75rem 1.75rem 0.5rem;
  line-height: 1.35;
  white-space: normal;
}
.collection-card-body {
  padding: 1rem 1.75rem 1.25rem;
}
.collection-card-actions {
  padding: 0 1.75rem 1.75rem;
}
.menu-pills {
  gap: 0.5rem;
}
.menu-pill {
  cursor: pointer;
}
</style>
