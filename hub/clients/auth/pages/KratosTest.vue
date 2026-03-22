<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { isAxiosError } from "axios";
import type { LoginFlow, RegistrationFlow, UiNode } from "@ory/client";
import {
  fetchBrowserLoginFlow,
  fetchBrowserRegistrationFlow,
  fetchLoginFlowById,
  fetchRegistrationFlowById,
  getKratosFrontendApi,
  useInvalidateKratosSession,
  useKratosSession,
} from "@sderickson/recipes-sdk";

const sessionQuery = useKratosSession();
const { isLoading: sessionLoading, isError: sessionErrored, error: sessionError } = sessionQuery;
const invalidateSession = useInvalidateKratosSession();
const route = useRoute();

const loginFlow = ref<LoginFlow | null>(null);
const registrationFlow = ref<RegistrationFlow | null>(null);
const flowsError = ref<string | null>(null);
const flowsLoading = ref(false);

const loginSubmitting = ref(false);
const registrationSubmitting = ref(false);

const session = computed(() => sessionQuery.data?.value ?? null);

const identityEmail = computed(() => {
  const traits = session.value?.identity?.traits as { email?: string } | undefined;
  return traits?.email ?? "";
});

const emailVerified = computed(() => {
  const id = session.value?.identity;
  if (!id?.verifiable_addresses?.length) return false;
  return id.verifiable_addresses.some((a) => a.via === "email" && a.verified);
});

function isInputAttributes(
  node: UiNode,
): node is UiNode & { attributes: Extract<UiNode["attributes"], { node_type: "input" }> } {
  return (
    node.type === "input" &&
    (node.attributes as { node_type?: string }).node_type === "input"
  );
}

async function loadFlowsFromQuery(flowId: string) {
  flowsError.value = null;
  flowsLoading.value = true;
  try {
    try {
      loginFlow.value = await fetchLoginFlowById(flowId);
      registrationFlow.value = null;
      return;
    } catch {
      /* try registration */
    }
    registrationFlow.value = await fetchRegistrationFlowById(flowId);
    loginFlow.value = null;
  } catch (e) {
    flowsError.value =
      e instanceof Error ? e.message : "Could not load flow from URL (invalid or expired id).";
  } finally {
    flowsLoading.value = false;
  }
}

async function loadFreshFlows() {
  flowsError.value = null;
  flowsLoading.value = true;
  try {
    const [login, reg] = await Promise.all([
      fetchBrowserLoginFlow(),
      fetchBrowserRegistrationFlow(),
    ]);
    loginFlow.value = login;
    registrationFlow.value = reg;
  } catch (e) {
    flowsError.value =
      e instanceof Error ? e.message : "Failed to start Kratos login/registration flows.";
  } finally {
    flowsLoading.value = false;
  }
}

watch(
  () => sessionQuery.status.value,
  async (status) => {
    if (status !== "success") return;
    if (sessionQuery.data.value) return;
    const flowId = typeof route.query.flow === "string" ? route.query.flow : undefined;
    if (flowId) await loadFlowsFromQuery(flowId);
    else await loadFreshFlows();
  },
  { immediate: true },
);

watch(
  () => sessionQuery.data.value,
  async (data) => {
    if (data) return;
    if (sessionQuery.status.value !== "success") return;
    await loadFreshFlows();
  },
);

function extractLoginFlowFromError(e: unknown): LoginFlow | undefined {
  if (!isAxiosError(e)) return undefined;
  const d = e.response?.data;
  if (d && typeof d === "object" && "ui" in d && "id" in d) {
    return d as LoginFlow;
  }
  return undefined;
}

function extractRegistrationFlowFromError(e: unknown): RegistrationFlow | undefined {
  if (!isAxiosError(e)) return undefined;
  const d = e.response?.data;
  if (d && typeof d === "object" && "ui" in d && "id" in d) {
    return d as RegistrationFlow;
  }
  return undefined;
}

async function onLoginSubmit(ev: Event) {
  const form = ev.target as HTMLFormElement;
  if (!loginFlow.value) return;
  const fd = new FormData(form);
  loginSubmitting.value = true;
  try {
    await getKratosFrontendApi().updateLoginFlow({
      flow: loginFlow.value.id,
      updateLoginFlowBody: {
        method: "password",
        csrf_token: String(fd.get("csrf_token") ?? ""),
        identifier: String(fd.get("identifier") ?? ""),
        password: String(fd.get("password") ?? ""),
      },
    });
    await invalidateSession();
  } catch (e) {
    const next = extractLoginFlowFromError(e);
    if (next) {
      loginFlow.value = next;
    } else {
      flowsError.value = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : e instanceof Error
          ? e.message
          : "Login failed.";
    }
  } finally {
    loginSubmitting.value = false;
  }
}

async function onRegistrationSubmit(ev: Event) {
  const form = ev.target as HTMLFormElement;
  if (!registrationFlow.value) return;
  const fd = new FormData(form);
  const email =
    String(fd.get("traits.email") ?? "").trim() ||
    String(fd.get("email") ?? "").trim() ||
    String(fd.get("traits[email]") ?? "").trim();

  registrationSubmitting.value = true;
  try {
    await getKratosFrontendApi().updateRegistrationFlow({
      flow: registrationFlow.value.id,
      updateRegistrationFlowBody: {
        method: "password",
        csrf_token: String(fd.get("csrf_token") ?? ""),
        password: String(fd.get("password") ?? ""),
        traits: { email },
      },
    });
    await invalidateSession();
  } catch (e) {
    const next = extractRegistrationFlowFromError(e);
    if (next) {
      registrationFlow.value = next;
    } else {
      flowsError.value = isAxiosError(e)
        ? String(e.response?.data ?? e.message)
        : e instanceof Error
          ? e.message
          : "Registration failed.";
    }
  } finally {
    registrationSubmitting.value = false;
  }
}

async function logout() {
  const { data } = await getKratosFrontendApi().createBrowserLogoutFlow({});
  window.location.href = data.logout_url;
}
</script>

<template>
  <v-container class="py-8" max-width="720">
    <h1 class="text-h5 mb-4">Kratos integration test</h1>

    <v-alert v-if="sessionLoading" type="info" variant="tonal" class="mb-4">
      Checking session…
    </v-alert>
    <v-alert v-else-if="sessionErrored" type="error" variant="tonal" class="mb-4">
      {{ sessionError }}
    </v-alert>

    <template v-else-if="session">
      <v-card variant="outlined" class="pa-4 mb-4">
        <p class="text-body-1"><strong>Identity ID:</strong> {{ session.identity?.id }}</p>
        <p class="text-body-1"><strong>Email:</strong> {{ identityEmail || "—" }}</p>
        <p class="text-body-1">
          <strong>Email verified:</strong> {{ emailVerified ? "yes" : "no" }}
        </p>
        <v-btn color="primary" class="mt-4" @click="logout">Log out</v-btn>
      </v-card>
    </template>

    <template v-else>
      <v-alert v-if="flowsError" type="error" variant="tonal" class="mb-4">{{ flowsError }}</v-alert>
      <v-progress-linear v-if="flowsLoading" indeterminate class="mb-4" />

      <v-row v-if="!flowsLoading">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-4">
            <h2 class="text-h6 mb-3">Log in</h2>
            <template v-if="loginFlow">
              <div
                v-for="(m, i) in loginFlow.ui.messages ?? []"
                :key="'lm-' + i"
                class="text-body-2 mb-2"
                :class="m.type === 'error' ? 'text-error' : ''"
              >
                {{ m.text }}
              </div>
              <form @submit.prevent="onLoginSubmit">
                <template v-for="(node, idx) in loginFlow.ui.nodes" :key="'ln-' + idx">
                  <p v-if="node.type === 'text'" class="text-body-2 mb-2">
                    {{ (node.attributes as { text?: { text: string } }).text?.text }}
                  </p>
                  <div v-else-if="isInputAttributes(node)" class="mb-3">
                    <label
                      v-if="node.meta?.label?.text && node.attributes.type !== 'submit'"
                      class="text-caption d-block mb-1"
                      :for="'login-' + idx"
                    >
                      {{ node.meta.label.text }}
                    </label>
                    <input
                      :id="'login-' + idx"
                      class="kratos-input"
                      :class="{ 'kratos-input--submit': node.attributes.type === 'submit' }"
                      :name="node.attributes.name"
                      :type="node.attributes.type"
                      :value="node.attributes.value ?? undefined"
                      :required="node.attributes.required"
                      :disabled="loginSubmitting"
                      autocomplete="off"
                    />
                  </div>
                </template>
              </form>
            </template>
            <p v-else class="text-medium-emphasis">Loading login form…</p>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-4">
            <h2 class="text-h6 mb-3">Register</h2>
            <template v-if="registrationFlow">
              <div
                v-for="(m, i) in registrationFlow.ui.messages ?? []"
                :key="'rm-' + i"
                class="text-body-2 mb-2"
                :class="m.type === 'error' ? 'text-error' : ''"
              >
                {{ m.text }}
              </div>
              <form @submit.prevent="onRegistrationSubmit">
                <template v-for="(node, idx) in registrationFlow.ui.nodes" :key="'rn-' + idx">
                  <p v-if="node.type === 'text'" class="text-body-2 mb-2">
                    {{ (node.attributes as { text?: { text: string } }).text?.text }}
                  </p>
                  <div v-else-if="isInputAttributes(node)" class="mb-3">
                    <label
                      v-if="node.meta?.label?.text && node.attributes.type !== 'submit'"
                      class="text-caption d-block mb-1"
                      :for="'reg-' + idx"
                    >
                      {{ node.meta.label.text }}
                    </label>
                    <input
                      :id="'reg-' + idx"
                      class="kratos-input"
                      :class="{ 'kratos-input--submit': node.attributes.type === 'submit' }"
                      :name="node.attributes.name"
                      :type="node.attributes.type"
                      :value="node.attributes.value ?? undefined"
                      :required="node.attributes.required"
                      :disabled="registrationSubmitting"
                      autocomplete="off"
                    />
                  </div>
                </template>
              </form>
            </template>
            <p v-else class="text-medium-emphasis">Loading registration form…</p>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.kratos-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.26);
  border-radius: 4px;
  font: inherit;
}
.kratos-input--submit {
  cursor: pointer;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border: none;
  font-weight: 600;
}
</style>
