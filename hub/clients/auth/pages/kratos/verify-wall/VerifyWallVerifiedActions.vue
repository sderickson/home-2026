<template>
  <div class="d-flex flex-column flex-sm-row ga-3 flex-wrap">
    <v-btn color="primary" tag="a" :href="continueHref">
      {{ t(strings.cta_continue) }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { verify_wall_verified_actions as strings } from "./VerifyWallVerifiedActions.strings.ts";

defineProps<{
  continueHref: string;
}>();

const { t } = useReverseT();
</script>
