/**
 * Milestone 2 — Login flow.
 * Packages: hub/clients/auth, recipes wiring.
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

export const KratosAuthM2LoginWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m2-login",
  description: "Kratos M2: login page + router wiring; redirect to recipes.",
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
      path: "./pages/kratos/login",
      urlPath: "/login",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 2).

Create **Kratos login** at \`/login\`:
- \`createBrowserLoginFlow\` / \`getLoginFlow\`, render \`ui.nodes\`, \`updateLoginFlow\`; handle error responses that return an updated LoginFlow.
- Support optional \`?flow=\` for email-related returns if applicable.
- On success: invalidate session query, redirect to **recipes** (same pattern as registration).
- Replace or bypass legacy \`LoginPage\` from \`@saflib/auth\` for this client when wired.`,
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} (M2).

Wire **router** so \`/login\` uses the new Kratos login view. Confirm manual path: logout → login → recipes with session.`,
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM2LoginWorkflowDefinition;
