<template>
  <p class="text-body-1 mb-6">{{ t(strings.body) }}</p>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { verify_wall_blocked_body as strings } from "./VerifyWallBlockedBody.strings.ts";

const { t } = useReverseT();
</script>
