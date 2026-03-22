/**
 * Milestone 4 — Account recovery (forgot password).
 * Packages: hub/clients/auth, recipes SDK.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
  PromptStepMachine,
} from "@saflib/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const KratosAuthM4RecoveryWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m4-recovery",
  description:
    "Kratos M4: recovery UI + SDK helpers; align all three kratos.yml recovery ui_url.",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "kratos-auth.spec.md"),
    plan: path.join(import.meta.dirname, "kratos-auth.plan.md"),
  },
  versionControl: { allowPaths: ["**/*"], commitEachStep: true },
  steps: [
    step(CdStepMachine, () => ({ path: "../../hub/clients/auth" })),

    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/kratos/recovery",
      urlPath: "/recovery",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 4).

Create **account recovery** at \`/recovery\` (must match \`selfservice.flows.recovery.ui_url\` in all kratos.yml files — adjust path in config if you choose a different URL like \`/forgot\`).

- \`createBrowserRecoveryFlow\`, \`getRecoveryFlow\`, \`updateRecoveryFlow\`; support \`?flow=\` from email links.
- Multi-step flows: replace RecoveryFlow from error responses when applicable.
- Do not change kratos-courier; rely on existing email links.`,
    })),

    step(CdStepMachine, () => ({ path: "../../../recipes/service/sdk" })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} (M4).

CWD is \`recipes/service/sdk\`. Extend \`requests/kratos/\` with recovery flow helpers if not already present. Confirm manual test: request recovery → email (mock) → complete flow → login works.`,
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM4RecoveryWorkflowDefinition;
