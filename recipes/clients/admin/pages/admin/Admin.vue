<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>

    <v-card class="mt-6" max-width="600">
      <v-card-title>{{ t(strings.seed_section_title) }}</v-card-title>
      <v-card-text>
        <p>{{ t(strings.seed_section_description) }}</p>
        <div v-if="seeding" class="mt-3">
          <div class="d-flex align-center gap-2 mb-1">
            <span class="text-body-2">{{ t(strings.progress_label) }}: {{ seedProgress }}%</span>
          </div>
          <v-progress-linear
            :model-value="seedProgress"
            color="primary"
            height="8"
            rounded
          />
          <p v-if="seedStatusMessage" class="text-body-2 text-medium-emphasis mt-2">
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
            <span class="text-body-2">{{ t(strings.progress_label) }}: {{ cleanupProgress }}%</span>
          </div>
          <v-progress-linear
            :model-value="cleanupProgress"
            color="primary"
            height="8"
            rounded
          />
          <p v-if="cleanupStatusMessage" class="text-body-2 text-medium-emphasis mt-2">
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
        <p v-if="cleanupMessage" class="ml-4 text-body-2">{{ cleanupMessage }}</p>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { admin_page as strings } from "./Admin.strings.ts";
import { useAdminLoader } from "./Admin.loader.ts";
import { useReverseT } from "@sderickson/recipes-admin-spa/i18n";
import { useSeedData } from "@sderickson/recipes-clients-common/seed";
import { useCleanupSeedData } from "./useCleanupSeedData.ts";

const { t } = useReverseT();
useAdminLoader();

const {
  runSeed,
  seeding,
  seedMessage,
  progress: seedProgress,
  statusMessage: seedStatusMessage,
} = useSeedData({
  getSuccessMessage: () => t(strings.seed_success),
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
</script>
