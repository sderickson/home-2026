<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  DynamicRecipesLayout,
  isDemoMode,
} from "@sderickson/recipes-clients-common";
import { useSeedData } from "@sderickson/recipes-clients-common/seed";
import { useProfile } from "@saflib/auth";

const queryClient = useQueryClient();
const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value?.id);
const isAdmin = computed(() => profileQuery.data?.value?.isAdmin ?? false);

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
