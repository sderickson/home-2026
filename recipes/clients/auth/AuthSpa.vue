<script setup lang="ts">
import { computed } from "vue";
import { RecipesLayout } from "@sderickson/recipes-clients-common";
import { useProfile } from "@saflib/auth";

const profileQuery = useProfile();
const loggedIn = computed(() => !!profileQuery.data?.value);
</script>

<template>
  <RecipesLayout :logged-in="loggedIn">
    <router-view />
  </RecipesLayout>
</template>
