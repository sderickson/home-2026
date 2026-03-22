/**
 * Milestone 1 — Registration + logout + recipes redirect + JIT TanStack hooks for registration.
 * Packages: hub/clients/auth, recipes/service/sdk, recipes client wiring.
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

export const KratosAuthM1RegistrationLogoutWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m1-registration-logout",
  description:
    "Kratos M1: JIT SDK mutations/queries for registration + registration page + logout + router + recipes redirect.",
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
      prompt: `Read **${context.docFiles!.plan}** (M1 — JIT SDK).

CWD is \`recipes/service/sdk\`. **TanStack mutation: update registration flow**

Add a dedicated module (e.g. \`requests/kratos/use-update-registration-flow.ts\` or alongside session pattern) that exports \`useUpdateRegistrationFlowMutation\` wrapping \`getKratosFrontendApi().updateRegistrationFlow\`, invalidates kratos session on success, and surfaces flow errors (Axios body may contain updated RegistrationFlow).

Structure this file like **sdk/add-mutation** output (useMutation, thin \`mutationFn\`), but call **FrontendApi**, not \`getClient()\`.`,
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read **${context.docFiles!.plan}** (M1 — JIT SDK).

CWD is \`recipes/service/sdk\`. **TanStack query (optional): registration flow**

If the registration page needs a cached flow: add \`useRegistrationFlowQuery\` (or equivalent) using \`queryOptions\` + \`fetchBrowserRegistrationFlow\` / \`fetchRegistrationFlowById\` from \`kratos-flows.ts\`, with a stable \`queryKey\` including flow id when present.

Structure like **sdk/add-query** output, but call **kratos-flows** / FrontendApi — not OpenAPI \`getClient()\`.

Export from \`requests/kratos/index.ts\`.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck recipes SDK after registration JIT hooks.",
    })),

    step(CdStepMachine, () => ({ path: "../../../hub/clients/auth" })),

    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/kratos/registration",
      urlPath: "/registration",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 1).

Create the **Kratos registration** view at \`/registration\`:
- Use JIT SDK hooks + \`kratos-flows\` as needed; render \`ui.nodes\`; submit registration; on error, replace flow from Axios error body when present.
- After success: invalidate session, **redirect to recipes app** (link helpers / env).
- Include **logout** (createBrowserLogoutFlow → navigate to \`logout_url\`) for testing.

Align path with \`selfservice.flows.registration.ui_url\` in kratos.yml.`,
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} (M1 — routing).

**Hub auth \`router.ts\`:** Either **remove** \`createAuthRouter\` from \`@saflib/auth\` entirely and use \`createRouter\` with only the routes needed, **or** register the new Kratos routes **before** any legacy auth routes so they take precedence. Do not preserve legacy login/register pages through \`createAuthRouter\` for this milestone.

**Recipes client:** Wire post-registration redirect into the recipes SPA (hosts/URLs for dev).

**Manual check:** register → recipes with session → logout → session cleared.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck hub auth SPA.",
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM1RegistrationLogoutWorkflowDefinition;
