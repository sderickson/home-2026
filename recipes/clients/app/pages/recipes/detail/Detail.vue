<template>
  <v-container>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <v-btn :to="'/recipes/list'" variant="text" prepend-icon="mdi-arrow-left">
        {{ t(strings.back_to_list) }}
      </v-btn>
      <v-spacer />
      <v-btn
        :to="`/recipes/${recipe.id}/edit`"
        color="primary"
        prepend-icon="mdi-pencil"
      >
        {{ t(strings.edit_recipe) }}
      </v-btn>
    </div>
    <RecipeContentPreview
      :title="recipe.title"
      :short-description="recipe.shortDescription"
      :long-description="recipe.longDescription ?? undefined"
      :content="content"
    />

    <template v-if="showVersionHistory">
      <v-divider class="my-4" />
      <h2 class="text-h6 mb-2">{{ t(strings.version_history) }}</h2>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-history"
        @click="versionHistoryModalOpen = true"
      >
        {{ t(strings.version_history_open) }}
      </v-btn>
    </template>

    <v-dialog
      v-model="versionHistoryModalOpen"
      max-width="600"
      persistent
      @click:outside="versionHistoryModalOpen = false"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          {{ t(strings.version_history_modal_title) }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="versionHistoryModalOpen = false"
          />
        </v-card-title>
        <v-card-text>
          <v-expansion-panels variant="accordion">
            <v-expansion-panel
              v-for="ver in versionsNewestFirst"
              :key="ver.id"
              :value="ver.id"
            >
              <v-expansion-panel-title>
                {{
                  ver.isLatest
                    ? t(strings.version_latest)
                    : (t(strings.version_from_date) as string).replace(
                        "{date}",
                        formatVersionDate(ver.createdAt),
                      )
                }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <RecipeContentPreview
                  :title="recipe.title"
                  :short-description="recipe.shortDescription"
                  :long-description="recipe.longDescription ?? undefined"
                  :content="ver.content"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="versionHistoryModalOpen = false">
            {{ t(strings.close) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  canShowVersionHistory,
  formatVersionDate,
} from "./Detail.logic.ts";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const { profileQuery, recipeQuery, versionsQuery } = useDetailLoader();

assertRecipeLoaded(recipeQuery.data.value);
assertProfileLoaded(profileQuery.data.value);
assertVersionsLoaded(versionsQuery.data.value);

const recipe = computed(() => recipeQuery.data.value!.recipe);
const currentVersion = computed(() => recipeQuery.data.value!.currentVersion);
const content = computed(() => currentVersion.value.content);
const profile = computed(() => profileQuery.data.value);
const versions = computed(() => versionsQuery.data.value ?? []);
const showVersionHistory = computed(() =>
  canShowVersionHistory(profile.value as { isAdmin?: boolean }),
);

const versionHistoryModalOpen = ref(false);

const versionsNewestFirst = computed(() => [...versions.value].reverse());
</script>
