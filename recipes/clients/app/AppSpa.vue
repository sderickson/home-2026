<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RecipesLayout, isDemoMode } from "@sderickson/recipes-clients-common";
import { useSeedData } from "@sderickson/recipes-clients-common/seed";
import { useProfile } from "@saflib/auth";

const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value?.id);
const isAdmin = computed(() => profileQuery.data?.value?.isAdmin ?? false);

const { runSeed } = useSeedData({ getSuccessMessage: () => "Demo data ready" });
onMounted(() => {
  if (isDemoMode()) runSeed();
});
</script>

<template>
  <RecipesLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <router-view />
  </RecipesLayout>
</template>
