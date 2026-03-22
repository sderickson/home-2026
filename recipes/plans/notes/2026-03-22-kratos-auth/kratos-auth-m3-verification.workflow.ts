/**
 * Milestone 3 — Verification (code) + verify wall in the shared auth SPA only.
 * Packages: hub/clients/auth, recipes/service/sdk (JIT).
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

export const KratosAuthM3VerificationWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m3-verification",
  description:
    "Kratos M3: JIT SDK for verification + verification page + verify wall in hub auth app (not recipes).",
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
      prompt: `Read **${context.docFiles!.plan}** (M3 — JIT SDK).

CWD is \`recipes/service/sdk\`. **Verification flow — TanStack (query + mutation)**

Add modules under \`requests/kratos/\` structured like **sdk/add-query** / **sdk/add-mutation** (thin \`useQuery\` / \`useMutation\`), but calling **FrontendApi**:
- Query: load verification flow — \`createBrowserVerificationFlow\` / \`getVerificationFlow\` (flow id from route/\`?flow=\`).
- Mutation: \`updateVerificationFlow\`.

Export from \`requests/kratos/index.ts\`.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck recipes SDK after verification JIT hooks.",
    })),

    step(CdStepMachine, () => ({ path: "../../../hub/clients/auth" })),

    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/kratos/verification",
      urlPath: "/verification",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 3).

Create **email verification** at \`/verification\` (match Kratos \`verification.ui_url\`):
- Code method: render \`ui.nodes\`, \`updateVerificationFlow\`.
- Support \`?flow=\` from email links.`,
    })),

    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/kratos/verify-wall",
      urlPath: "/verify-wall",
      prompt: `Read ${context.docFiles!.spec} (M3).

Create **verify wall** in the **hub auth app** at \`/verify-wall\` (or the path aligned with product links):

- When the user has a Kratos session but **email is not verified**, keep them on this **shared auth SPA** (show message + link to verification flow / resend as Kratos allows).
- **Do not** implement this wall inside \`recipes/clients/app\` — the wall is shared for any product that uses hub auth post-registration.

Wire **navigation guards** or post-login routing in **hub auth** so post-registration and post-login send unverified users here before redirecting to recipes (or other products).`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck hub auth SPA.",
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM3VerificationWorkflowDefinition;
