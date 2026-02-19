<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>
  </v-container>
</template>

<script setup lang="ts">
import { admin_page as strings } from "./Admin.strings.ts";
import { useAdminLoader } from "./Admin.loader.ts";
import { useReverseT } from "@sderickson/notebook-admin-spa/i18n";

const { t } = useReverseT();
useAdminLoader();
</script>
