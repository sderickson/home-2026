<script setup lang="ts">
import { computed } from "vue";
import { DynamicRecipesLayout } from "@sderickson/recipes-clients-common";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import { adminLinks } from "@sderickson/recipes-links";
import { isDevelopmentDeployment } from "@saflib/vue";

const sessionQuery = useKratosSession();
const loggedIn = computed(() => !!sessionQuery.data.value?.identity);

const adminSidebarLinks = [
  { ...adminLinks.home, name: "Home" },
  { ...adminLinks.users, name: "Users" },
  { ...adminLinks.cronJobs, name: "Cron" },
  { ...adminLinks.jobs, name: "Jobs" },
];

const devObservabilitySidebarLinks = computed(() => {
  if (!isDevelopmentDeployment()) {
    return [];
  }
  return [
    { ...adminLinks.errors, name: "Errors" },
    { ...adminLinks.logs, name: "Logs" },
    { ...adminLinks.metrics, name: "Metrics" },
    { ...adminLinks.events, name: "Events" },
  ];
});
</script>

<template>
  <DynamicRecipesLayout
    :logged-in="loggedIn"
    :sidebar-links="adminSidebarLinks"
    :dev-sidebar-links="devObservabilitySidebarLinks"
  >
    <router-view />
  </DynamicRecipesLayout>
</template>
