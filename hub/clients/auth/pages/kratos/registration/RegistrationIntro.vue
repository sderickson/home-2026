<template>
  <div>
    <h1 class="text-h4 mb-2">{{ t(strings.title) }}</h1>
    <p class="text-h6 text-medium-emphasis mb-2">{{ t(strings.subtitle) }}</p>
    <p class="text-body-1 text-medium-emphasis mb-4">{{ t(strings.description) }}</p>
    <nav class="text-body-2 mb-6" aria-label="Sign in">
      <a :href="loginHref" class="text-primary text-decoration-none">{{ t(strings.link_login) }}</a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { useAuthFlowCrossLinks } from "../common/useAuthFlowCrossLinks.ts";
import { registration_intro as strings } from "./RegistrationIntro.strings.ts";

const { t } = useReverseT();
const { loginHref } = useAuthFlowCrossLinks();
</script>
