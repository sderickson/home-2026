<template>
  <v-container v-if="showVerifiedWall" class="py-8" max-width="720">
    <VerifyWallVerifiedIntro />
    <VerifyWallVerifiedActions :continue-href="redirectAfter" />
  </v-container>
  <v-container v-else-if="showUnverifiedWall" class="py-8" max-width="720">
    <VerifyWallIntro :identity-email="identityEmail" />
    <VerifyWallBlockedBody />
    <VerifyWallActions :continue-href="redirectAfter" />
  </v-container>
</template>

<script setup lang="ts">
import { useVerifyWallLoader } from "./VerifyWall.loader.ts";
import { useVerifyWallPage } from "./useVerifyWallPage.ts";
import VerifyWallActions from "./VerifyWallActions.vue";
import VerifyWallBlockedBody from "./VerifyWallBlockedBody.vue";
import VerifyWallIntro from "./VerifyWallIntro.vue";
import VerifyWallVerifiedActions from "./VerifyWallVerifiedActions.vue";
import VerifyWallVerifiedIntro from "./VerifyWallVerifiedIntro.vue";

const { sessionQuery } = useVerifyWallLoader();

if (sessionQuery.status.value !== "success") {
  throw new Error("Failed to load session");
}

const {
  showVerifiedWall,
  showUnverifiedWall,
  identityEmail,
  redirectAfter,
} = useVerifyWallPage(sessionQuery);
</script>
