/**
 * Milestone 0 — Kratos config (all three yml) + recipes SDK: TanStack hooks for Kratos.
 * **Start cwd:** `recipes/plans` (where `saf-workflow` runs). **Cd** is relative to that cwd only.
 * **Do not** `cd` into `recipes/` — it is not a package. Use `../..` for repo root, `../service/sdk` for `@sderickson/recipes-sdk`.
 *
 * Note: `sdk/add-query` and `sdk/add-mutation` generate `getClient()` OpenAPI calls. Kratos uses
 * `@ory/client` `FrontendApi`, not the product OpenAPI spec — so we do **not** invoke those
 * generators for Kratos (they would emit wrong HTTP). Each step below is one **focused prompt**
 * structured like a single generator run (one concern, one file or small set, then typecheck).
 */
import {
  defineWorkflow,
  step,
  CdStepMachine,
  PromptStepMachine,
  CommandStepMachine,
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
    "Kratos M0: three kratos.yml files + M0 SDK scope (session query only; registration/login/etc. JIT in M1+).",
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
    //     step(CdStepMachine, () => ({ path: "../.." })),

    //     step(PromptStepMachine, ({ context }) => ({
    //       prompt: `Read **${context.docFiles!.spec}** and **${context.docFiles!.plan}** (Milestone 0 — config only).

    // CWD is the **repo root** (from \`recipes/plans\` via \`cd ../..\`). Edit **three** Kratos configs:
    // - \`recipes/dev/kratos/kratos.yml\`
    // - \`deploy/kratos-prod-local/kratos.yml\`
    // - \`deploy/remote-assets/kratos/kratos.yml\`

    // Add \`selfservice.flows.recovery\` with \`enabled: true\` and \`ui_url\` for the hub auth recovery route. Keep **verification** \`ui_url\` and \`use: code\` aligned with planned routes.

    // Do not change SDK or Vue in this step. Do not change \`post-kratos-courier\`.`,
    //     })),

    step(CdStepMachine, () => ({ path: "../service/sdk" })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read **${context.docFiles!.plan}** (SDK inventory — M0).

CWD is \`recipes/service/sdk\`. **TanStack query (session only for M0)**

Target file: \`requests/kratos/kratos-session.ts\`

- Ensure \`kratosSessionQueryOptions\` / \`useKratosSession\` wrap \`getKratosFrontendApi().toSession\` and treat 401 as \`null\` session.
- Keep \`useInvalidateKratosSession\` for post-login/register/logout.

This step mirrors **one** \`sdk/add-query\` run in scope (single module), but uses Ory \`FrontendApi\` instead of \`getClient()\`. **Do not** add registration/login/recovery/verification TanStack wrappers here — those are **JIT** in M1–M4 per plan.`,
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read **${context.docFiles!.plan}**.

CWD is \`recipes/service/sdk\`. **Kratos client + flow fetchers (no new TanStack hooks unless already missing)**

- \`requests/kratos/kratos-client.ts\` — base URL / \`new Configuration\` / credentials as needed for browser.
- \`requests/kratos/kratos-flows.ts\` — keep **async** \`fetchBrowserLoginFlow\`, \`fetchBrowserRegistrationFlow\`, \`fetch*FlowById\` as today; **do not** add \`useMutation\`/\`useQuery\` here in M0 unless required to compile.

- \`requests/kratos/index.ts\` — export public surface.

Run typecheck for this package after edits.`,
    })),

    step(CommandStepMachine, () => ({
      command: "npm",
      args: ["run", "typecheck"],
      description: "Typecheck recipes SDK after Kratos session/client edits.",
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM0ConfigSdkWorkflowDefinition;
