<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>
    <p>
      <i18n-t
        scope="global"
        :keypath="lookupTKey(strings.logged_in_as)"
      >
        <template #email>{{ profile?.email }}</template>
      </i18n-t>
    </p>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/notebook-app-spa/i18n";
import { assertProfileLoaded } from "./Home.logic.ts";

const { t, lookupTKey } = useReverseT();
const { profileQuery } = useHomeLoader();

const profile = computed(() => profileQuery.data.value);
assertProfileLoaded(profile.value);
</script>
