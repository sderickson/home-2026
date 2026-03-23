/**
 * Milestone 6 — E2E tests, remove prototype pages, polish.
 * **Start cwd:** `recipes/plans`. `../../hub/clients/auth` → hub auth SPA package (do not `cd` into `recipes/`).
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
  PromptStepMachine,
} from "@saflib/workflows";
import { AddE2eTestWorkflowDefinition } from "@saflib/vue/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const KratosAuthM6TestsPolishWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/kratos-auth-m6-tests-polish",
  description:
    "Kratos M6: Playwright e2e for auth flows; retire KratosTest; i18n/a11y polish.",
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

    step(makeWorkflowMachine(AddE2eTestWorkflowDefinition), () => ({
      path: "./e2e/kratos-auth-happy-path.spec.ts",
    })),

    step(PromptStepMachine, ({ context }) => ({
      prompt: `Read ${context.docFiles!.spec} (M6).

1. Remove or hide **KratosTest** (\`/kratos-test\`) if product flows replace it.
2. Run typecheck/tests for hub auth and recipes clients; fix i18n and accessibility gaps on Kratos-driven forms (\`ui.nodes\`).`,
    })),

    GetFeedbackStep,
  ],
});

export default KratosAuthM6TestsPolishWorkflowDefinition;
