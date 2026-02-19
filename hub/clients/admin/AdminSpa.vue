<script setup lang="ts">
import { HubLayout } from "@sderickson/hub-clients-common";
</script>

<template>
  <HubLayout :logged-in="true" :is-admin="true">
    <router-view />
  </HubLayout>
</template>
