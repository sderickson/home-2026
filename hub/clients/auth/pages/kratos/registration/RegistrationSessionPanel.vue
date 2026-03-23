<template>
  <div>
    <i18n-t
      scope="global"
      :keypath="lookupTKey(strings.logged_in_with_email)"
      tag="p"
      class="text-body-1 mb-4"
    >
      <template #email>{{ identityEmail }}</template>
    </i18n-t>
    <v-btn
      color="primary"
      variant="outlined"
      :loading="pending"
      :aria-label="t(strings.logout_aria)"
      @click="startBrowserLogout"
    >
      {{ t(strings.logout) }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { registration_session_panel as strings } from "./RegistrationSessionPanel.strings.ts";
import { useKratosBrowserLogout } from "./useKratosBrowserLogout.ts";

defineProps<{
  identityEmail: string;
}>();

const { t, lookupTKey } = useReverseT();
const { pending, startBrowserLogout } = useKratosBrowserLogout();
</script>
