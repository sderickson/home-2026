<template>
  <v-alert type="info" variant="tonal" class="mb-4">
    Re-authentication required. Redirecting to sign in...
  </v-alert>

  <v-btn :href="redirectBrowserTo">Go now</v-btn>
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
