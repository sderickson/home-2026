/**
 * Milestone 3 — Verification (code) + verify wall in recipes.
 * Packages: hub/clients/auth, recipes/clients/app.
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

export const KratosAuthM3VerificationWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m3-verification",
  description:
    "Kratos M3: verification flow (code) + recipes verify wall gating unverified users.",
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
      path: "./pages/kratos/verification",
      urlPath: "/verification",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 3).

Create **email verification** at \`/verification\` (match Kratos \`verification.ui_url\`):
- \`createBrowserVerificationFlow\` / \`getVerificationFlow\` (including \`?flow=\` from email links).
- Config uses **code** method: render nodes from Kratos (\`updateVerificationFlow\`).
- After success, refresh session and route user appropriately.`,
    })),

    step(CdStepMachine, () => ({ path: "../../../recipes/clients/app" })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} (M3).

In **recipes client** (\`recipes/clients/app\`): implement **verify wall** behavior — if the user is authenticated but email is **not** verified, show the verify wall / verification UX instead of the main app shell. Reuse or adapt existing verify-wall routes from \`@saflib/identity/auth\` patterns if present.

Do not send unverified users straight into the main app experience until policy is satisfied.`,
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM3VerificationWorkflowDefinition;
