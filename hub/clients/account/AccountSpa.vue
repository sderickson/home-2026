<script setup lang="ts">
import { computed } from "vue";
import { HubLayout } from "@sderickson/hub-clients-common";
import { useProfile } from "@saflib/auth";

const profileQuery = useProfile();
const isAdmin = computed(() => profileQuery.data?.value?.isAdmin ?? false);
</script>

<template>
  <HubLayout :logged-in="true" :is-admin="isAdmin">
    <router-view />
  </HubLayout>
</template>
