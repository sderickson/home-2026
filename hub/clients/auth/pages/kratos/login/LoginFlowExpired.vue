<template>
  <KratosFlowExpiredPanel :message="t(strings.message)" :cta="t(strings.cta_restart)" />
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import KratosFlowExpiredPanel from "../common/KratosFlowExpiredPanel.vue";
import { login_flow_expired as strings } from "./LoginFlowExpired.strings.ts";

const { t } = useReverseT();
</script>
