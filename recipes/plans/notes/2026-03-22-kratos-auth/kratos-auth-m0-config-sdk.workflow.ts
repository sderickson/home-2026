/**
 * Milestone 0 — Kratos config (all three yml) + recipes SDK Kratos helpers.
 * Run from recipes/plans so paths resolve.
 */
import {
  defineWorkflow,
  step,
  CdStepMachine,
  PromptStepMachine,
} from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const KratosAuthM0ConfigSdkWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m0-config-sdk",
  description:
    "Kratos M0: recovery + ui_url in three kratos.yml files; extend recipes SDK requests/kratos for registration + session.",
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
    step(CdStepMachine, () => ({ path: ".." })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read **${context.docFiles!.spec}** and **${context.docFiles!.plan}** (Milestone 0).

CWD is \`recipes/\`. Implement M0 only:

1. **Kratos YAML (three files)** — Add \`selfservice.flows.recovery\` with \`enabled: true\` and \`ui_url\` matching the hub auth SPA route you will use for recovery. Keep **verification** \`ui_url\` and \`use: code\` consistent with the spec. Edit:
   - \`dev/kratos/kratos.yml\`
   - \`../deploy/kratos-prod-local/kratos.yml\`
   - \`../deploy/remote-assets/kratos/kratos.yml\`

2. **Recipes SDK** — Under \`service/sdk/requests/kratos/\`, extend existing modules (\`kratos-client.ts\`, \`kratos-flows.ts\`, \`kratos-session.ts\`) so the app can create/update **browser registration flow** and read **session** (\`toSession\`). Follow patterns already used for login/registration in \`kratos-flows.ts\` and \`KratosTest.vue\`. Export anything new from the SDK package index if that is the project convention.

Do not implement Vue pages in this step. Do not change \`post-kratos-courier\`.`,
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM0ConfigSdkWorkflowDefinition;
