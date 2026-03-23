<template>
  <v-container class="py-8" max-width="720">
    <RegistrationIntro />
    <RegistrationSessionPanel v-if="session" :identity-email="identityEmail" />
    <RegistrationFlowForm v-else-if="flowIdForForm" :flow-id="flowIdForForm" />
  </v-container>
</template>

<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { linkToHrefWithHost, navigateToLink } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { authLinks } from "@sderickson/hub-links";
import { identityNeedsEmailVerification, registrationFlowQueryKey } from "@sderickson/recipes-sdk";
import {
  registrationFlowQueryEnabledForSession,
  useRegistrationLoader,
} from "./Registration.loader.ts";
import RegistrationFlowForm from "./RegistrationFlowForm.vue";
import RegistrationIntro from "./RegistrationIntro.vue";
import RegistrationSessionPanel from "./RegistrationSessionPanel.vue";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { sessionQuery, registrationFlowQuery } = useRegistrationLoader();

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

watch(
  () => session.value,
  (s) => {
    if (!s) return;
    if (identityNeedsEmailVerification(s.identity)) {
      navigateToLink(authLinks.kratosVerifyWall, {
        params: { redirect: linkToHrefWithHost(appLinks.home) },
      });
    }
  },
  { immediate: true },
);

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

const identityEmail = computed(() => {
  const s = session.value;
  const traits = s?.identity?.traits as { email?: string } | undefined;
  return traits?.email ?? "";
});
</script>
