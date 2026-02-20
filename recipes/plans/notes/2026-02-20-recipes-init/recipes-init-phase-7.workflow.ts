/**
 * Phase 7: Root client (public, read-only). Package: recipes/clients/root.
 * After each view, refactor shared logic into recipes/service/sdk.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const RecipesInitPhase7WorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-7",
  description: "Root client: public recipe list, recipe detail, menu list, menu detail; refactor into SDK after each.",
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
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/list",
      prompt: `Orientation: Read context.docFiles.spec and context.docFiles.plan. Make sure you understand the overall plan and your part in it (Phase 7: root client — public recipe list, recipe detail, menu list, menu detail; refactor into SDK after each). Then: Add public recipe list page (read-only). Use SDK recipe list query. After implementing, refactor shared listing/display into recipes/service/sdk (e.g. sdk/add-component for recipe list item) so app client can reuse. See plan Phase 7.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Add public recipe detail page (current version, ingredients, instructions). Use SDK. After implementing, refactor recipe display (for making/cooking) into recipes/service/sdk. See plan Phase 7.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/list",
      prompt: `Add public menu list page. After implementing, refactor menu list display into SDK if reusable. See plan Phase 7.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/detail",
      prompt: `Add public menu detail page (groupings, recipe ids, short descriptions from recipe). Refactor into SDK if reusable. See plan Phase 7.`,
    })),
  ],
});

export default RecipesInitPhase7WorkflowDefinition;
