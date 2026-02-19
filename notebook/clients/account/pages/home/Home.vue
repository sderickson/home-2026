<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>
    <v-btn v-bind="profileLinkProps" variant="text" class="mr-2">
      {{ t(strings.link_profile) }}
    </v-btn>
    <v-btn v-bind="passwordLinkProps" variant="text">
      {{ t(strings.link_password) }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/notebook-account-spa/i18n";
import {
  assertProfileLoaded,
  getProfileLinkProps,
  getPasswordLinkProps,
} from "./Home.logic.ts";

const { t } = useReverseT();
const { profileQuery } = useHomeLoader();

const profile = computed(() => profileQuery.data.value);
assertProfileLoaded(profile.value);

const profileLinkProps = getProfileLinkProps();
const passwordLinkProps = getPasswordLinkProps();
</script>
