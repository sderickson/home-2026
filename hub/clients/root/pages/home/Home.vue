<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>
    <div class="d-flex flex-wrap ga-3">
      <v-btn v-bind="registerLinkProps" color="primary">
        {{ t(strings.cta_register) }}
      </v-btn>
      <v-btn v-bind="loginLinkProps" variant="outlined">
        {{ t(strings.cta_login) }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/hub-root-spa/i18n";
import { getLoginLinkProps, getRegisterLinkProps } from "./Home.logic.ts";

const { t } = useReverseT();
useHomeLoader();

const registerLinkProps = getRegisterLinkProps();
const loginLinkProps = getLoginLinkProps();
</script>
