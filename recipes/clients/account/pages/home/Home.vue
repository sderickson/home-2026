<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>
    <v-btn v-bind="profileLinkProps" color="primary" class="mr-2">
      {{ t(strings.link_profile) }}
    </v-btn>
    <v-btn v-bind="passwordLinkProps" variant="outlined">
      {{ t(strings.link_password) }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-account-spa/i18n";
import { linkToProps } from "@saflib/links";
import { accountLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
const { profileQuery } = useHomeLoader();

if (!profileQuery.data.value) {
  throw new Error("Failed to load profile");
}

const profileLinkProps = linkToProps(accountLinks.profile);
const passwordLinkProps = linkToProps(accountLinks.password);
</script>
