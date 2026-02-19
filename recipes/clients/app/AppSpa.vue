<script setup lang="ts">
import { RecipesLayout } from "@sderickson/recipes-clients-common";
</script>

<template>
  <RecipesLayout :logged-in="true">
    <router-view />
  </RecipesLayout>
</template>
