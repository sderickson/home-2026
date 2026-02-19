<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>
    <v-btn v-bind="registerLinkProps" color="primary">
      {{ t(strings.cta_register) }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/hub-root-spa/i18n";
import { getRegisterLinkProps } from "./Home.logic.ts";

const { t } = useReverseT();
useHomeLoader();

const registerLinkProps = getRegisterLinkProps();
</script>
