<script setup lang="ts">
import { computed } from "vue";
import { RecipesLayout } from "@sderickson/recipes-clients-common";
import { useProfile } from "@saflib/auth";

const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value?.id);
const isAdmin = computed(() => profileQuery.data?.value?.isAdmin ?? false);
</script>

<template>
  <RecipesLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <router-view />
  </RecipesLayout>
</template>
