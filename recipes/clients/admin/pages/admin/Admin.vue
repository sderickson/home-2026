<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>

    <v-card class="mt-6" max-width="600">
      <v-card-title>{{ t(strings.seed_section_title) }}</v-card-title>
      <v-card-text>
        <p>{{ t(strings.seed_section_description) }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          :loading="seeding"
          :disabled="seeding"
          @click="runSeed"
        >
          {{ t(strings.seed_button) }}
        </v-btn>
        <p v-if="seedMessage" class="ml-4 text-body-2">{{ seedMessage }}</p>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { admin_page as strings } from "./Admin.strings.ts";
import { useAdminLoader } from "./Admin.loader.ts";
import { useReverseT } from "@sderickson/recipes-admin-spa/i18n";
import { useSeedData } from "./useSeedData.ts";

const { t } = useReverseT();
useAdminLoader();

const { runSeed, seeding, seedMessage } = useSeedData({
  getSuccessMessage: () => t(strings.seed_success),
});
</script>
