<script setup lang="ts">
import { DynamicRecipesLayout } from "@sderickson/recipes-clients-common";
import { useProfile } from "@saflib/auth";
import { computed } from "vue";

const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value?.id);
const isAdmin = computed(() => profileQuery.data?.value?.isAdmin ?? false);
</script>

<template>
  <DynamicRecipesLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <router-view />
  </DynamicRecipesLayout>
</template>
