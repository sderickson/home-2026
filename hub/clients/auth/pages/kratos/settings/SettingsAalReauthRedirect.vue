<template>
  <v-container class="py-8" max-width="720">
    <v-alert type="info" variant="tonal">
      Re-authentication required. Redirecting to sign in...

      <v-btn :href="redirectBrowserTo">Go now</v-btn>
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

const props = defineProps<{
  redirectBrowserTo?: string;
}>();

onMounted(() => {
  if (!props.redirectBrowserTo) {
    throw new Error("Redirect browser to is required");
  }
  setTimeout(() => {
    window.location.replace(props.redirectBrowserTo!);
  }, 3000);
});
</script>
