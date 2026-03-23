<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <v-text-field v-bind="t(strings.example_input)"></v-text-field>
    <i18n-t
      v-if="profile.id"
      scope="global"
      :keypath="lookupTKey(strings.logged_in_with_email)"
    >
      <template #email>{{ profile.email }}</template>
    </i18n-t>
    <div v-else>{{ t(strings.not_logged_in) }}</div>
  </v-container>
</template>

<script setup lang="ts">
import { kratos_registration as strings } from "./Registration.strings.ts";
import { useRegistrationLoader } from "./Registration.loader.ts";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";

const { t, lookupTKey } = useReverseT();

const { profileQuery } = useRegistrationLoader();

// the Async component will not render if the data is not loaded
// check to make sure the data is loaded before rendering
if (!profileQuery.data.value) {
  throw new Error("Failed to load profile");
}

const profile = profileQuery.data.value;
</script>
