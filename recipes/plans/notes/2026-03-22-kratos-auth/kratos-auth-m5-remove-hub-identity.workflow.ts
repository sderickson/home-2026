/**
 * Milestone 5 — Remove hub identity service from hub + recipes monoliths.
 * **Start cwd:** `recipes/plans`. Use `cd ../..` for repo root (do not `cd` into `recipes/`).
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

export const KratosAuthM5RemoveHubIdentityWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m5-remove-hub-identity",
  description:
    "Kratos M5: stop startHubIdentityService in hub + recipes monoliths; deps and deploy env.",
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
    step(CdStepMachine, () => ({ path: "../.." })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 5).

CWD is the **repo root** (from \`recipes/plans\` via \`cd ../..\`). Decommission **hub identity** for the hub + recipes stack only:

1. **hub/service/monolith/run.ts** — Remove \`startHubIdentityService()\` and import from \`@sderickson/hub-identity\`. Remove package dependency from \`hub/service/monolith/package.json\` if unused.

2. **recipes/service/monolith/run.ts** — Same.

3. **Deploy / Docker / env** — Remove or repoint \`IDENTITY_SERVICE_GRPC_HOST\` and related vars for these services where they only existed for hub-identity (e.g. \`deploy/remote-assets/env.hub.config\`, docker-compose, Caddy snippets). Do not break notebook or other products that still need identity unless this file is hub/recipes-only.

4. **Verify** monoliths start and Kratos-only auth still works.

Notebook monolith is **out of scope** unless spec is extended.`,
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM5RemoveHubIdentityWorkflowDefinition;
