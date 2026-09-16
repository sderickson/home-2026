<script setup lang="ts">
import { computed } from "vue";
import { DynamicRecipesLayout } from "@sderickson/recipes-clients-common";
import { useKratosSession } from "@saflib/ory-kratos-sdk";

const sessionQuery = useKratosSession();
const loggedIn = computed(() => !!sessionQuery.data.value?.identity);
</script>

<template>
  <DynamicRecipesLayout :logged-in="loggedIn">
    <router-view />
  </DynamicRecipesLayout>
</template>
