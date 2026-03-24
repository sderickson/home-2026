<script setup lang="ts">
import { computed } from "vue";
import { DynamicRecipesLayout } from "@sderickson/recipes-clients-common";
import { useKratosSession } from "@sderickson/recipes-sdk";

const sessionQuery = useKratosSession();
const loggedIn = computed(() => !!sessionQuery.data.value?.identity);
const isAdmin = computed(() => false);
</script>

<template>
  <DynamicRecipesLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <router-view />
  </DynamicRecipesLayout>
</template>
