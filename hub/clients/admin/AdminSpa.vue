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
  <HubLayout
    :logged-in="loggedIn"
    disable-container
    :sidebar-links="adminSidebarLinks"
    :dev-sidebar-links="devObservabilitySidebarLinks"
  >
    <router-view />
  </HubLayout>
</template>
