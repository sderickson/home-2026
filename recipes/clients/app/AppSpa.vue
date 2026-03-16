<script setup lang="ts">
import { computed } from "vue";
import { RecipesLayout } from "@sderickson/recipes-clients-common";
import { useProfile } from "@saflib/auth";
import { useDemoMode } from "./useDemoMode.ts";

const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value?.id);
const isAdmin = computed(() => profileQuery.data?.value?.isAdmin ?? false);
const { isDemoMode, resetDemoData, exitDemoMode } = useDemoMode();
</script>

<template>
  <RecipesLayout
    :logged-in="loggedIn"
    :is-admin="isAdmin"
    :demo-mode="isDemoMode"
    :on-reset-demo="resetDemoData"
    :on-exit-demo="exitDemoMode"
  >
    <router-view />
  </RecipesLayout>
</template>
