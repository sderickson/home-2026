/**
 * Milestone 2 — Login: JIT TanStack hooks for login, then login page.
 * **Start cwd:** `recipes/plans`. Each `CdStepMachine` path is relative to that cwd only (not chained). `../service/sdk` → SDK; `../../hub/clients/auth` → hub auth SPA.
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

export const KratosAuthM2LoginWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m2-login",
  description:
    "Kratos M2: JIT SDK login mutation/query + login view + router; redirect to recipes.",
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
      prompt: `Read **${context.docFiles!.plan}** (M2 — JIT SDK).

    CWD is \`recipes/service/sdk\`. **TanStack mutation: update login flow**

    Add \`useUpdateLoginFlowMutation\` (or equivalent) wrapping \`getKratosFrontendApi().updateLoginFlow\`, same structural pattern as M1 registration mutation (FrontendApi, not OpenAPI \`getClient()\`).`,
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read **${context.docFiles!.plan}** (M2 — JIT SDK).

    CWD is \`recipes/service/sdk\`. **TanStack query (optional): login flow**

    If the login page needs a cached flow: \`useLoginFlowQuery\` via \`queryOptions\` + \`fetchBrowserLoginFlow\` / \`fetchLoginFlowById\` from \`kratos-flows.ts\`.

    Export new hooks from \`requests/kratos/index.ts\`.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck recipes SDK after login JIT hooks.",
    })),

    step(CdStepMachine, () => ({ path: "../../hub/clients/auth" })),

    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/kratos/login",
      urlPath: "/login",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 2).

Create **Kratos login** at \`/login\` using JIT SDK hooks + \`kratos-flows\`:
- Handle LoginFlow errors in Axios body; invalidate session on success; redirect to **recipes**.`,
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} (M2).

Wire **hub auth router** so \`/login\` resolves to the new view. Manual check: logout → login → recipes with session.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck hub auth SPA.",
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM2LoginWorkflowDefinition;
