<template>
  <v-container class="py-8" max-width="720">
    <RegistrationIntro />
    <RegistrationSessionPanel
      v-if="session"
      :identity-email="identityEmail"
    />
    <RegistrationFlowForm v-else />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRegistrationLoader } from "./Registration.loader.ts";
import RegistrationFlowForm from "./RegistrationFlowForm.vue";
import RegistrationIntro from "./RegistrationIntro.vue";
import RegistrationSessionPanel from "./RegistrationSessionPanel.vue";

const { sessionQuery, registrationFlowQuery } = useRegistrationLoader();

if (sessionQuery.status.value !== "success") {
  throw new Error("Failed to load session");
}
if (
  registrationFlowQuery.status.value !== "success" ||
  !registrationFlowQuery.data.value
) {
  throw new Error("Failed to load registration flow");
}

const session = computed(() => sessionQuery.data.value);
const identityEmail = computed(() => {
  const s = session.value;
  const traits = s?.identity?.traits as { email?: string } | undefined;
  return traits?.email ?? "";
});
</script>
