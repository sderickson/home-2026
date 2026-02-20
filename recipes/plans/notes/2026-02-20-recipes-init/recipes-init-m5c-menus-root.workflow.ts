/**
 * Milestone 5c: Menus logged-out — Root menu list + detail, refactor into SDK.
 * Packages: recipes/clients/root, recipes/service/sdk.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";

const input = [] as const;
interface Context {}

export const RecipesInitM5cMenusRootWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-m5c-menus-root",
  description:
    "Milestone 5c: Root client — public menu list, menu detail; refactor into SDK.",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "recipes-init.spec.md"),
    plan: path.join(import.meta.dirname, "recipes-init.plan.md"),
  },
  versionControl: { allowPaths: ["**/*"], commitEachStep: true },
  steps: [
    step(CdStepMachine, () => ({ path: "../clients/root" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), ({ context }) => ({
      path: "./pages/menus/list",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 5c: root menu list + detail; refactor into SDK). Then: Add public menu list page. Use SDK. After implementing, refactor menu list display into SDK if reusable. See plan M5c.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/detail",
      prompt: `Add public menu detail page (groupings, recipe ids, short descriptions from recipe). Refactor into SDK if reusable. See plan M5c.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitM5cMenusRootWorkflowDefinition;
