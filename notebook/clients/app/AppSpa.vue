<script setup lang="ts">
import { NotebookLayout } from "@sderickson/notebook-clients-common";
</script>

<template>
  <NotebookLayout :logged-in="true">
    <router-view />
  </NotebookLayout>
</template>
