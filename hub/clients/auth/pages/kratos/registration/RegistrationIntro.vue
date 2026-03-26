<template>
  <div>
    <div class="float-right mb-4">
      <a
        :href="loginHref"
        class="text-primary text-decoration-none d-inline-flex align-center ga-1"
      >
        {{ t(strings.link_login) }}
        <v-icon icon="mdi-chevron-right" size="small" />
      </a>
    </div>
    <div style="clear: both"></div>
    <h1 class="text-h4 mb-2">{{ t(strings.title) }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { useAuthFlowCrossLinks } from "../common/useAuthFlowCrossLinks.ts";
import { registration_intro as strings } from "./RegistrationIntro.strings.ts";

const { t } = useReverseT();
const { loginHref } = useAuthFlowCrossLinks();
</script>
