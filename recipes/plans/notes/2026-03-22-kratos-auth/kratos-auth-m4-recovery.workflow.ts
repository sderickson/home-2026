/**
 * Milestone 4 — Account recovery: SDK first, then recovery page in hub auth.
 * Packages: recipes/service/sdk, hub/clients/auth.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
  PromptStepMachine,
  CommandStepMachine,
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
    "Kratos M4: JIT SDK recovery query/mutation + recovery page; kratos.yml recovery ui_url already set in M0.",
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
    step(CdStepMachine, () => ({ path: "../service/sdk" })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read **${context.docFiles!.plan}** (M4 — SDK inventory).

CWD is \`recipes/service/sdk\`. **Recovery — TanStack query + mutation (Ory FrontendApi)**

Extend \`requests/kratos/kratos-flows.ts\` with async helpers if missing:
- \`fetchBrowserRecoveryFlow\`, \`fetchRecoveryFlowById\` / \`getRecoveryFlow\`

Add dedicated hook modules (structure like **sdk/add-query** / **sdk/add-mutation**, but FrontendApi only):
- **Query:** load recovery flow for the current step (browser create + get by id).
- **Mutation:** \`updateRecoveryFlow\`.

**Why here:** Recovery UI needs stable hook entry points; flows are multi-step and errors return updated RecoveryFlow in the Axios body — mirror registration/login patterns.

Export from \`requests/kratos/index.ts\`.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck recipes SDK after recovery hooks.",
    })),

    step(CdStepMachine, () => ({ path: "../../../hub/clients/auth" })),

    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/kratos/recovery",
      urlPath: "/recovery",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 4).

Create **account recovery** at \`/recovery\` (must match \`selfservice.flows.recovery.ui_url\` in all three kratos.yml files).

- Use JIT SDK hooks from M4; support \`?flow=\` from email links.
- Multi-step: replace RecoveryFlow from error responses when applicable.
- Do not change kratos-courier.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck hub auth SPA.",
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM4RecoveryWorkflowDefinition;
