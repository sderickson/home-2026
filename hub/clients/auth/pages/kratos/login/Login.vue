<template>
  <v-container class="py-8" max-width="720">
    <LoginIntro v-if="!effectiveSession" />
    <!-- <AuthSessionDecisionPanel
      v-if="effectiveSession"
      :identity-email="identityEmail"
      :continue-href="continueHref"
      variant="login"
    /> -->
    <LoginFlowForm
      :flow-id="flowIdForForm"
      :browser-return-to="browserReturnTo"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { useRoute, useRouter } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { identityNeedsEmailVerification } from "@sderickson/recipes-sdk";
import { loginFlowQueryKey } from "@sderickson/recipes-sdk";
import AuthSessionDecisionPanel from "../common/AuthSessionDecisionPanel.vue";
import { sessionDisplayEmail } from "../verify-wall/VerifyWall.logic.ts";
import {
  loginFlowQueryEnabledForSession,
  useLoginBrowserReturnTo,
  useLoginLoader,
} from "./Login.loader.ts";
import LoginFlowForm from "./LoginFlowForm.vue";
import LoginIntro from "./LoginIntro.vue";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const { sessionQuery, loginFlowQuery } = useLoginLoader();
const browserReturnTo = useLoginBrowserReturnTo();
const loginRefresh = computed(
  () => route.query.refresh === "true" || route.query.refresh === "1",
);

const loginFlowEnabled = computed(() =>
  loginFlowQueryEnabledForSession(sessionQuery, loginRefresh.value),
);

if (sessionQuery.status.value !== "success") {
  throw new Error("Failed to load session");
}

const session = computed(() => sessionQuery.data.value);
const effectiveSession = computed(() =>
  loginRefresh.value ? null : session.value,
);

const identityEmail = computed(() => {
  const s = effectiveSession.value;
  return s ? sessionDisplayEmail(s) : "";
});

/** Continue target when a session already exists: verified users skip the verify wall and use `?redirect=` / fallback only. */
const continueHref = computed(() => {
  const s = effectiveSession.value;
  if (!s) return "";
  if (!identityNeedsEmailVerification(s.identity)) {
    return browserReturnTo.value;
  }
  return linkToHrefWithHost(authLinks.kratosVerifyWall, {
    params: { redirect: browserReturnTo.value },
  });
});

watch(
  () => ({
    status: loginFlowQuery.status.value,
    data: loginFlowQuery.data.value,
    flowParam: route.query.flow,
  }),
  ({ status, data, flowParam }) => {
    if (status !== "success" || !data?.id) return;
    if (typeof flowParam === "string") return;
    queryClient.setQueryData(loginFlowQueryKey(data.id), data);
    router.replace({
      path: route.path,
      query: { ...route.query, flow: data.id },
    });
  },
  { immediate: true },
);

const flowIdForForm = computed(() => {
  if (typeof route.query.flow === "string") return route.query.flow;
  return loginFlowQuery.data.value?.id ?? "";
});

if (
  !effectiveSession.value &&
  loginFlowEnabled.value &&
  (loginFlowQuery.status.value !== "success" || !loginFlowQuery.data.value?.id)
) {
  throw new Error("Failed to load login flow");
}
</script>
