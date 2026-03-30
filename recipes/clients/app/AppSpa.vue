<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  DynamicRecipesLayout,
  isDemoMode,
} from "@sderickson/recipes-clients-common";
import { useSeedData } from "@sderickson/recipes-clients-common/seed";
import { useKratosSession } from "@saflib/ory-kratos-sdk";

const queryClient = useQueryClient();
const kratosSessionQuery = useKratosSession();
const loggedIn = computed(() => !!kratosSessionQuery.data.value?.identity);
const isAdmin = computed(() => false);
const { runSeed } = useSeedData({ getSuccessMessage: () => "Demo data ready" });
onMounted(async () => {
  if (!isDemoMode()) return;
  const { clearMocks } = await import("@sderickson/recipes-sdk/fakes");
  clearMocks();
  queryClient.invalidateQueries();
  await runSeed();
  queryClient.invalidateQueries();
});
</script>

<template>
  <DynamicRecipesLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <router-view />
  </DynamicRecipesLayout>
</template>
