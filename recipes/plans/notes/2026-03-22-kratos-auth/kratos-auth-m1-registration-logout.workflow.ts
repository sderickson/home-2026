/**
 * Milestone 1 — Registration + logout + recipes redirect.
 * Packages: hub/clients/auth, recipes/clients/app, recipes SDK.
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

export const KratosAuthM1RegistrationLogoutWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m1-registration-logout",
  description:
    "Kratos M1: registration page + logout; redirect to recipes after register; wire hub auth router.",
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
      path: "./pages/kratos/registration",
      urlPath: "/registration",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 1).

Create the **Kratos registration** view at \`/registration\`:
- Use \`@ory/client\` / recipes SDK helpers to load \`createBrowserRegistrationFlow\` (or get by id from query), render \`ui.nodes\`, submit \`updateRegistrationFlow\`; on error, replace flow from Axios error body when present.
- After successful registration, user should have a Kratos session; invalidate session query and **redirect to the recipes app** (use existing link helpers / env base URLs as in hub auth).
- Align with Kratos \`selfservice.flows.registration.ui_url\` in kratos.yml (path may be \`/registration\` or align \`/register\` vs \`/registration\` with authLinks + config consistently).

Include a **logout** affordance reachable from this milestone (e.g. button that runs \`createBrowserLogoutFlow\` then \`window.location\` to \`logout_url\`) so testers can clear session before later milestones.`,
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 1 continued).

1. **Hub auth router** (\`hub/clients/auth/router.ts\`): Register the new registration route; remove or keep \`/kratos-test\` per product preference; ensure \`createAuthRouter\` / additional routes point to Kratos registration instead of legacy RegisterPage where this project applies.

2. **Recipes client**: Wire entry so post-registration redirect lands in the recipes SPA; ensure auth subdomain links use correct hosts in dev.

3. **Manual check**: register → recipes with session → logout → \`toSession\` logged out.`,
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM1RegistrationLogoutWorkflowDefinition;
