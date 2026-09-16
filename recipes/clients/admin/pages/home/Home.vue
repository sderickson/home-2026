<template>
  <ContentWidth>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.description) }}</p>

    <div class="mt-4 text-body-2">
      <p class="text-medium-emphasis mb-1">{{ t(strings.gitHashesHeading) }}</p>
      <p class="mb-0">
        <span class="text-medium-emphasis">{{ t(strings.gitHashRoot) }}:</span>
        <code class="ms-1">{{ git_hashes.root }}</code>
      </p>
      <p class="mb-0">
        <span class="text-medium-emphasis">{{ t(strings.gitHashSaflib) }}:</span>
        <code class="ms-1">{{ git_hashes.saflib }}</code>
      </p>
    </div>

    <v-card class="mt-6" max-width="600">
      <v-card-title>{{ t(strings.seed_section_title) }}</v-card-title>
      <v-card-text>
        <p>{{ t(strings.seed_section_description) }}</p>
        <div v-if="seeding" class="mt-3">
          <div class="d-flex align-center gap-2 mb-1">
            <span class="text-body-2"
              >{{ t(strings.progress_label) }}: {{ seedProgress }}%</span
            >
          </div>
          <v-progress-linear
            :model-value="seedProgress"
            color="primary"
            height="8"
            rounded
          />
          <p
            v-if="seedStatusMessage"
            class="text-body-2 text-medium-emphasis mt-2"
          >
            {{ seedStatusMessage }}
          </p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          :loading="seeding"
          :disabled="seeding || cleaning"
          @click="runSeed"
        >
          {{ t(strings.seed_button) }}
        </v-btn>
        <p v-if="seedMessage" class="ml-4 text-body-2">{{ seedMessage }}</p>
      </v-card-actions>
    </v-card>

    <v-card class="mt-6" max-width="600">
      <v-card-title>{{ t(strings.cleanup_section_title) }}</v-card-title>
      <v-card-text>
        <p>{{ t(strings.cleanup_section_description) }}</p>
        <div v-if="cleaning" class="mt-3">
          <div class="d-flex align-center gap-2 mb-1">
            <span class="text-body-2"
              >{{ t(strings.progress_label) }}: {{ cleanupProgress }}%</span
            >
          </div>
          <v-progress-linear
            :model-value="cleanupProgress"
            color="primary"
            height="8"
            rounded
          />
          <p
            v-if="cleanupStatusMessage"
            class="text-body-2 text-medium-emphasis mt-2"
          >
            {{ cleanupStatusMessage }}
          </p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          variant="outlined"
          :loading="cleaning"
          :disabled="seeding || cleaning"
          @click="runCleanup"
        >
          {{ t(strings.cleanup_button) }}
        </v-btn>
        <p v-if="cleanupMessage" class="ml-4 text-body-2">
          {{ cleanupMessage }}
        </p>
      </v-card-actions>
    </v-card>

    <div class="mt-4">
      <ErrorSmokeWidgets />
    </div>
  </ContentWidth>
</template>

<script setup lang="ts">
import ErrorSmokeWidgets from "@saflib/errors-vue/pages/ErrorSmokeWidgets.vue";
import { getGitHashes } from "@saflib/vue";
import { ContentWidth } from "@saflib/vue/components";
import { home as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-admin-spa/i18n";
import { useSeedData } from "@sderickson/recipes-clients-common/seed";
import { useCleanupSeedData } from "./useCleanupSeedData.ts";

const { t } = useReverseT();
useHomeLoader();

const {
  runSeed,
  seeding,
  seedMessage,
  progress: seedProgress,
  statusMessage: seedStatusMessage,
} = useSeedData({
  getSuccessMessage: () => t(strings.seed_button_success),
});

const {
  runCleanup,
  cleaning,
  cleanupMessage,
  progress: cleanupProgress,
  statusMessage: cleanupStatusMessage,
} = useCleanupSeedData({
  getSuccessMessage: () => t(strings.cleanup_success),
  getNotFoundMessage: () => t(strings.cleanup_not_found),
});

const git_hashes = getGitHashes();
</script>
