<template>
  <div>
    <h1 class="text-h4 mb-2">{{ t(strings.title) }}</h1>
    <p class="text-h6 text-medium-emphasis mb-2">{{ t(strings.subtitle) }}</p>
    <i18n-t
      v-if="identityEmail"
      scope="global"
      :keypath="lookupTKey(strings.email_line)"
      tag="p"
      class="text-body-1 mb-4"
    >
      <template #email>{{ identityEmail }}</template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { verify_wall_intro as strings } from "./VerifyWallIntro.strings.ts";

defineProps<{
  /** Empty when the session has no display email yet. */
  identityEmail?: string;
}>();

const { t, lookupTKey } = useReverseT();
</script>
