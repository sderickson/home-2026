<template>
  <v-container v-if="showWall" class="py-8" max-width="720">
    <VerifyWallIntro :identity-email="identityEmail" />
    <VerifyWallBlockedBody />
    <VerifyWallActions :verification-href="verificationHref" />
  </v-container>
</template>

<script setup lang="ts">
import { useVerifyWallLoader } from "./VerifyWall.loader.ts";
import { useVerifyWallPage } from "./useVerifyWallPage.ts";
import VerifyWallActions from "./VerifyWallActions.vue";
import VerifyWallBlockedBody from "./VerifyWallBlockedBody.vue";
import VerifyWallIntro from "./VerifyWallIntro.vue";

const { sessionQuery } = useVerifyWallLoader();

if (sessionQuery.status.value !== "success") {
  throw new Error("Failed to load session");
}

const { showWall, identityEmail, verificationHref } = useVerifyWallPage(sessionQuery);
</script>
