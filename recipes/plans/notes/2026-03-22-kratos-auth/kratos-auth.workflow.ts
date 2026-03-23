/**
 * Orchestrator: runs kratos-auth milestone workflows in order.
 * Run from **recipes/plans**. Cd targets must be packages or repo root (`../..`); never `cd` into `recipes/` alone.
 */
import { defineWorkflow, step, makeWorkflowMachine } from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import { KratosAuthM0ConfigSdkWorkflowDefinition } from "./kratos-auth-m0-config-sdk.workflow.ts";
import { KratosAuthM1RegistrationLogoutWorkflowDefinition } from "./kratos-auth-m1-registration-logout.workflow.ts";
import { KratosAuthM2LoginWorkflowDefinition } from "./kratos-auth-m2-login.workflow.ts";
import { KratosAuthM3VerificationWorkflowDefinition } from "./kratos-auth-m3-verification.workflow.ts";
import { KratosAuthM4RecoveryWorkflowDefinition } from "./kratos-auth-m4-recovery.workflow.ts";
import { KratosAuthM5RemoveHubIdentityWorkflowDefinition } from "./kratos-auth-m5-remove-hub-identity.workflow.ts";
import { KratosAuthM6TestsPolishWorkflowDefinition } from "./kratos-auth-m6-tests-polish.workflow.ts";
import path from "path";

const input = [] as const;
interface KratosAuthWorkflowContext {}

export const KratosAuthWorkflowDefinition = defineWorkflow<
  typeof input,
  KratosAuthWorkflowContext
>({
  id: "plans/kratos-auth",
  description:
    "Orchestrator: Kratos browser auth for hub/recipes (M0–M6). See kratos-auth.plan.md.",
  input,
  context: ({ input }) => ({
    agentConfig: {
      ...input.agentConfig,
      resetTimeoutEachStep: true,
    },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "kratos-auth.spec.md"),
    plan: path.join(import.meta.dirname, "kratos-auth.plan.md"),
  },
  versionControl: {
    allowPaths: ["**/*"],
    commitEachStep: true,
  },
  steps: [
    step(makeWorkflowMachine(KratosAuthM0ConfigSdkWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(KratosAuthM1RegistrationLogoutWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(KratosAuthM2LoginWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(KratosAuthM3VerificationWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(KratosAuthM4RecoveryWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(KratosAuthM5RemoveHubIdentityWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(KratosAuthM6TestsPolishWorkflowDefinition), () => ({})),
    GetFeedbackStep,
  ],
});

export default KratosAuthWorkflowDefinition;
