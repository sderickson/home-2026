<template>
  <v-container class="py-8" max-width="720">
    <LoginIntro />
    <LoginFlowForm
      v-if="flowIdForForm"
      :flow-id="flowIdForForm"
      :browser-return-to="browserReturnTo"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { useRoute, useRouter } from "vue-router";
import { navigateToLink } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { loginFlowQueryKey } from "@sderickson/recipes-sdk";
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

const loginFlowEnabled = computed(() =>
  loginFlowQueryEnabledForSession(sessionQuery),
);

if (sessionQuery.status.value !== "success") {
  throw new Error("Failed to load session");
}

watch(
  () => sessionQuery.data.value,
  (session) => {
    if (session) {
      navigateToLink(appLinks.home);
    }
  },
  { immediate: true },
);

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
      query: { flow: data.id },
    });
  },
  { immediate: true },
);

const flowIdForForm = computed(() => {
  if (typeof route.query.flow === "string") return route.query.flow;
  return loginFlowQuery.data.value?.id ?? "";
});

if (
  !sessionQuery.data.value &&
  loginFlowEnabled.value &&
  (loginFlowQuery.status.value !== "success" || !loginFlowQuery.data.value?.id)
) {
  throw new Error("Failed to load login flow");
}
</script>
