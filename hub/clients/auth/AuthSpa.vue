<script setup lang="ts">
import { computed } from "vue";
import { HubLayout } from "@sderickson/hub-clients-common";
import { useProfile } from "@saflib/auth";

const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value);
</script>

<template>
  <HubLayout :logged-in="loggedIn">
    <router-view />
  </HubLayout>
</template>
