<template>
  <div class="d-flex flex-column flex-sm-row ga-3 flex-wrap">
    <v-btn color="primary" :href="verificationHref" tag="a">
      {{ t(strings.cta_verify) }}
    </v-btn>
    <v-btn
      variant="text"
      :loading="pending"
      :aria-label="t(strings.logout_aria)"
      @click="startBrowserLogout"
    >
      {{ t(strings.cta_logout) }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { useKratosBrowserLogout } from "../registration/useKratosBrowserLogout.ts";
import { verify_wall_actions as strings } from "./VerifyWallActions.strings.ts";

defineProps<{
  verificationHref: string;
}>();

const { t } = useReverseT();
const { pending, startBrowserLogout } = useKratosBrowserLogout();
</script>
