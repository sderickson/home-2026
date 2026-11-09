<script setup lang="ts">
import { computed } from "vue";
import { HubLayout } from "@sderickson/hub-clients-common";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import { adminLinks } from "@sderickson/hub-links";
import { isDevelopmentDeployment } from "@saflib/vue";

const sessionQuery = useKratosSession();
const loggedIn = computed(() => !!sessionQuery.data.value?.identity);

const adminSidebarLinks = [
  { ...adminLinks.home, name: "Home" },
  { ...adminLinks.users, name: "Users" },
  { ...adminLinks.opsIssues, name: "Issues" },
  { ...adminLinks.opsAlerts, name: "Alerts" },
  { ...adminLinks.opsMetrics, name: "Metrics" },
  { ...adminLinks.opsDependencies, name: "Dependencies" },
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
  <HubLayout
    :logged-in="loggedIn"
    disable-container
    :sidebar-links="adminSidebarLinks"
    :dev-sidebar-links="devObservabilitySidebarLinks"
  >
    <router-view />
  </HubLayout>
</template>
