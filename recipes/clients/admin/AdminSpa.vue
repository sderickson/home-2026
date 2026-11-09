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
  { ...adminLinks.opsIssues, name: "Issues" },
  { ...adminLinks.opsAlerts, name: "Alerts" },
  { ...adminLinks.opsMetrics, name: "Metrics" },
  { ...adminLinks.opsLogs, name: "Logs" },
  { ...adminLinks.opsTokens, name: "Ops tokens" },
];

const devObservabilitySidebarLinks = computed(() => {
  if (!isDevelopmentDeployment()) {
    return [];
  }
  return [
    { ...adminLinks.errors, name: "Errors" },
    { ...adminLinks.logs, name: "Live logs" },
    { ...adminLinks.metrics, name: "Live metrics" },
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
