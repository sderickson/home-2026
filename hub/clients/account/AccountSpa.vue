<script setup lang="ts">
import { computed } from "vue";
import { HubLayout } from "@sderickson/hub-clients-common";
import { useKratosSession } from "@saflib/ory-kratos-sdk";

const sessionQuery = useKratosSession();
const loggedIn = computed(() => !!sessionQuery.data.value?.identity);
const isAdmin = computed(() => false);
</script>

<template>
  <HubLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <router-view />
  </HubLayout>
</template>
