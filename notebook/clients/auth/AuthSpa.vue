<script setup lang="ts">
import { computed } from "vue";
import { NotebookLayout } from "@sderickson/notebook-clients-common";
import { useProfile } from "@saflib/auth";

const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value);
</script>

<template>
  <NotebookLayout :logged-in="loggedIn">
    <router-view />
  </NotebookLayout>
</template>
