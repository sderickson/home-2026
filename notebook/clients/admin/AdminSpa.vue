<script setup lang="ts">
import { computed } from "vue";
import { DynamicNotebookLayout } from "@sderickson/notebook-clients-common/components";
import { adminLinks } from "@sderickson/notebook-links";
import { isDevelopmentDeployment } from "@saflib/vue";

const adminSidebarLinks = [
  { ...adminLinks.home, name: "Home" },
  { ...adminLinks.users, name: "Users" },
  { ...adminLinks.cronJobs, name: "Cron" },
  { ...adminLinks.jobs, name: "Jobs" },
  { ...adminLinks.audit, name: "Audit" },
];

const devObservabilitySidebarLinks = computed(() => {
  if (!isDevelopmentDeployment()) {
    return [];
  }
  return [
    { ...adminLinks.errors, name: "Errors" },
    { ...adminLinks.emails, name: "Emails" },
    { ...adminLinks.logs, name: "Logs" },
    { ...adminLinks.metrics, name: "Metrics" },
    { ...adminLinks.events, name: "Events" },
  ];
});
</script>

<template>
  <DynamicNotebookLayout
    require-auth
    :sidebar-links="adminSidebarLinks"
    :dev-sidebar-links="devObservabilitySidebarLinks"
  >
    <router-view />
  </DynamicNotebookLayout>
</template>
