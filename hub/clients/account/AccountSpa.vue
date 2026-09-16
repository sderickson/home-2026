<script setup lang="ts">
import { computed } from "vue";
import { HubLayout } from "@sderickson/hub-clients-common";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";

const { data: session, isPending } = useKratosSession();
const loggedIn = computed(() => !!session.value?.identity);
const isAdmin = computed(() => false);
const loginHref = computed(() => {
  const returnTo =
    typeof window !== "undefined" ? window.location.href : "";
  return linkToHrefWithHost(authLinks.newLogin, {
    params: { return_to: returnTo },
  });
});
</script>

<template>
  <HubLayout
    :logged-in="loggedIn"
    :is-admin="isAdmin"
    disable-container
  >
    <div v-if="isPending" class="text-center py-12">
      <v-progress-circular indeterminate />
    </div>
    <div v-else-if="!loggedIn" class="text-center py-12">
      <p class="mb-4">Sign in to manage your account.</p>
      <v-btn color="primary" :href="loginHref">Log in</v-btn>
    </div>
    <router-view v-else />
  </HubLayout>
</template>
