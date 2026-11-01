<template>
  <!-- Events are rendered here for playwright tests to assert on -->
  <pre class="d-none" data-testid="events">{{ events }}</pre>

  <NotebookLayout
    :require-auth="requireAuth"
    :sidebar-links="sidebarLinks"
    :dev-sidebar-links="devSidebarLinks"
  >
    <slot />
  </NotebookLayout>

  <SnackbarQueue />
</template>

<script setup lang="ts">
import NotebookLayout from "./NotebookLayout.vue";
import { events } from "@saflib/vue";
import { SnackbarQueue } from "@saflib/vue/components";
import { type Link } from "@saflib/links";

type SidebarLink = Link & { name: string };

defineProps<{
  requireAuth?: boolean;
  sidebarLinks?: SidebarLink[];
  devSidebarLinks?: SidebarLink[];
}>();
</script>
