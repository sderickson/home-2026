<template>
  <RecipesLayout :logged-in="loggedIn">
    <Content />
  </RecipesLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Content } from "vitepress";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import RecipesLayout from "@sderickson/recipes-clients-common/components/recipes-layout";

// Signed-in visitors get the App/Account/Logout nav instead of Login.
const kratosSessionQuery = useKratosSession();
const loggedIn = computed(() => !!kratosSessionQuery.data.value?.identity);
</script>
