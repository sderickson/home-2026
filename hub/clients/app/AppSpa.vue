<script setup lang="ts">
import { HubLayout } from "@sderickson/hub-clients-common";
</script>

<template>
  <HubLayout :logged-in="true">
    <router-view />
  </HubLayout>
</template>
