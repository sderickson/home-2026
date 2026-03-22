<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  DynamicRecipesLayout,
  isDemoMode,
} from "@sderickson/recipes-clients-common";
import { useSeedData } from "@sderickson/recipes-clients-common/seed";
import { useProfile } from "@saflib/auth";
import { useKratosSession } from "@sderickson/recipes-sdk";

const queryClient = useQueryClient();
const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value?.id);
const isAdmin = computed(() => profileQuery.data?.value?.isAdmin ?? false);

const kratosSessionQuery = useKratosSession();
const kratosSessionStatus = computed(() => {
  if (kratosSessionQuery.isPending.value) {
    return "Checking Kratos session…";
  }
  if (kratosSessionQuery.isError.value) {
    return "Kratos session unavailable";
  }
  const session = kratosSessionQuery.data.value;
  if (session?.identity) {
    const email = (session.identity.traits as { email?: string })?.email ?? "";
    return email ? `Logged in as ${email}` : "Logged in (Kratos)";
  }
  return "Not logged in";
});

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
    <v-alert
      density="compact"
      variant="tonal"
      color="secondary"
      class="mb-3 text-body-2"
      border="start"
    >
      {{ kratosSessionStatus }}
    </v-alert>
    <router-view />
  </DynamicRecipesLayout>
</template>
