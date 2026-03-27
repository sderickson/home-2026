<template>
  <KratosFlowExpiredPanel
    :message="t(strings.message)"
    :cta="t(strings.cta_restart)"
    :preserve-query-keys="['return_to', 'token']"
  />
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import KratosFlowExpiredPanel from "../common/KratosFlowExpiredPanel.vue";
import { recovery_flow_expired as strings } from "./RecoveryFlowExpired.strings.ts";

const { t } = useReverseT();
</script>
