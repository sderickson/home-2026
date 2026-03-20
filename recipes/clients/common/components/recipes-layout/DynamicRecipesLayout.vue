<template>
  <!-- Events are rendered here for playwright tests to assert on -->
  <pre class="d-none" data-testid="events">{{ events }}</pre>

  <RecipesLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <template #app-bar-append>
      <v-btn
        v-if="demo.isDemoMode.value"
        color="warning"
        variant="flat"
        prepend-icon="mdi-exclamation"
        class="text-uppercase font-weight-regular mr-2"
        @click="demoDialogOpen = true"
      >
        {{ t(recipes_layout.demo_mode) }}
      </v-btn>
    </template>

    <slot />
  </RecipesLayout>

  <v-dialog v-model="demoDialogOpen" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>{{ t(recipes_layout.demo_dialog_title) }}</span>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="demoDialogOpen = false"
        />
      </v-card-title>
      <v-card-text>
        {{ t(recipes_layout.demo_banner_message) }}
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="demoDialogOpen = false">
          {{ t(recipes_layout.demo_cancel) }}
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          @click="
            onResetDemo();
            demoDialogOpen = false;
          "
        >
          {{ t(recipes_layout.demo_reset) }}
        </v-btn>
        <v-btn color="primary" variant="flat" @click="demo.exitDemoMode()">
          {{ t(recipes_layout.demo_exit) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <SnackbarQueue />
</template>

<script setup lang="ts">
import { ref } from "vue";
import RecipesLayout from "./RecipesLayout.vue";
import { recipes_layout } from "./RecipesLayout.strings.ts";
import { useReverseT } from "../../i18n.ts";
import { events } from "@saflib/vue";
import { SnackbarQueue } from "@saflib/vue/components";
import { useQueryClient } from "@tanstack/vue-query";
import { useDemoMode } from "../../composables/useDemoMode.ts";
import { useSeedData } from "../../seed/useSeedData.ts";

defineProps<{
  loggedIn?: boolean;
  isAdmin?: boolean;
}>();

const { t } = useReverseT();
const demo = useDemoMode();
const queryClient = useQueryClient();
const { runSeed } = useSeedData({
  getSuccessMessage: () => t(recipes_layout.demo_reset_done),
});
const demoDialogOpen = ref(false);

async function onResetDemo() {
  const { clearMocks } = await import("@sderickson/recipes-sdk/fakes");
  clearMocks();
  queryClient.invalidateQueries();
  await runSeed();
  queryClient.invalidateQueries();
}
</script>
