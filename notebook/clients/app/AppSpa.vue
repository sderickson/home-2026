<script setup lang="ts">
import { DynamicNotebookLayout } from "@sderickson/notebook-clients-common/components";
</script>

<template>
  <DynamicNotebookLayout require-auth>
    <router-view />
  </DynamicNotebookLayout>
</template>
