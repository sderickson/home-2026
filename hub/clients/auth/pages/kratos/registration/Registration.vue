<template>
  <v-container class="py-8" max-width="720">
    <RegistrationIntro v-if="!session" />
    <AuthSessionDecisionPanel
      v-if="session"
      :identity-email="identityEmail"
      :continue-href="continueHref"
      variant="registration"
    />
    <RegistrationFlowForm v-else-if="flowIdForForm" :flow-id="flowIdForForm" />
  </v-container>
</template>

<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { identityNeedsEmailVerification, registrationFlowQueryKey } from "@sderickson/recipes-sdk";
import AuthSessionDecisionPanel from "../common/AuthSessionDecisionPanel.vue";
import {
  registrationFlowQueryEnabledForSession,
  useRegistrationBrowserReturnTo,
  useRegistrationLoader,
} from "./Registration.loader.ts";
import RegistrationFlowForm from "./RegistrationFlowForm.vue";
import RegistrationIntro from "./RegistrationIntro.vue";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { sessionQuery, registrationFlowQuery } = useRegistrationLoader();
const browserReturnTo = useRegistrationBrowserReturnTo();

const registrationFlowEnabled = computed(() =>
  registrationFlowQueryEnabledForSession(sessionQuery),
);

if (sessionQuery.status.value !== "success") {
  throw new Error("Failed to load session");
}

watch(
  () => ({
    status: registrationFlowQuery.status.value,
    data: registrationFlowQuery.data.value,
    flowParam: route.query.flow,
  }),
  ({ status, data, flowParam }) => {
    if (status !== "success" || !data?.id) return;
    if (typeof flowParam === "string") return;
    queryClient.setQueryData(registrationFlowQueryKey(data.id), data);
    router.replace({
      path: route.path,
      query: { flow: data.id },
    });
  },
  { immediate: true },
);

const session = computed(() => sessionQuery.data.value);

const identityEmail = computed(() => {
  const s = session.value;
  const traits = s?.identity?.traits as { email?: string } | undefined;
  return traits?.email ?? "";
});

const continueHref = computed(() => {
  const s = session.value;
  if (!s) return "";
  if (identityNeedsEmailVerification(s.identity)) {
    return linkToHrefWithHost(authLinks.kratosVerifyWall, {
      params: { redirect: browserReturnTo.value },
    });
  }
  return browserReturnTo.value;
});

const flowIdForForm = computed(() => {
  if (typeof route.query.flow === "string") return route.query.flow;
  return registrationFlowQuery.data.value?.id ?? "";
});

if (
  !session.value &&
  registrationFlowEnabled.value &&
  (registrationFlowQuery.status.value !== "success" ||
    !registrationFlowQuery.data.value?.id)
) {
  throw new Error("Failed to load registration flow");
}
</script>
