<template>
  <div>
    <h1 class="text-h4 mb-2">{{ t(strings.title) }}</h1>
    <p class="text-h6 text-medium-emphasis mb-2">{{ t(strings.subtitle) }}</p>
    <p class="text-body-1 text-medium-emphasis mb-4">{{ t(strings.description) }}</p>
    <nav
      class="text-body-2 mb-6 d-flex flex-column flex-sm-row flex-wrap ga-2 ga-sm-6"
      aria-label="Other sign-in options"
    >
      <a :href="registerHref" class="text-primary text-decoration-none">{{ t(strings.link_register) }}</a>
      <a :href="recoveryHref" class="text-primary text-decoration-none">{{ t(strings.link_recovery) }}</a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { useAuthFlowCrossLinks } from "../common/useAuthFlowCrossLinks.ts";
import { login_intro as strings } from "./LoginIntro.strings.ts";

const { t } = useReverseT();
const { registerHref, recoveryHref } = useAuthFlowCrossLinks();
</script>
