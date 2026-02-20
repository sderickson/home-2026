/**
 * Orchestrator: runs recipes-init workflows in milestone order.
 * Each workflow can use a different agent (better context fit).
 * Run from recipes/plans so phase Cd paths (e.g. ../service/spec) resolve.
 *
 * Order: Phase 1 (recipes backend) → M1a, M1b, M1c (recipes frontend) →
 * Phase 2 → M2b (notes) → Phase 3 → M3b (recipe files) → Phase 4 → M4b (note files) →
 * Phase 5 → M5b, M5c (menus).
 */
import { defineWorkflow, step, makeWorkflowMachine } from "@saflib/workflows";
import { RecipesInitPhase1WorkflowDefinition } from "./recipes-init-phase-1.workflow.ts";
import { RecipesInitPhase1bWorkflowDefinition } from "./recipes-init-phase-1b.workflow.ts";
import { RecipesInitPhase1cWorkflowDefinition } from "./recipes-init-phase-1c.workflow.ts";
import { RecipesInitM1aAppRecipesWorkflowDefinition } from "./recipes-init-m1a-app-recipes.workflow.ts";
import { RecipesInitM1bRootRecipesWorkflowDefinition } from "./recipes-init-m1b-root-recipes.workflow.ts";
import { RecipesInitM1cVersionsWorkflowDefinition } from "./recipes-init-m1c-versions.workflow.ts";
import { RecipesInitPhase2WorkflowDefinition } from "./recipes-init-phase-2.workflow.ts";
import { RecipesInitM2bNotesFrontendWorkflowDefinition } from "./recipes-init-m2b-notes-frontend.workflow.ts";
import { RecipesInitPhase3WorkflowDefinition } from "./recipes-init-phase-3.workflow.ts";
import { RecipesInitM3bRecipeFilesFrontendWorkflowDefinition } from "./recipes-init-m3b-recipe-files-frontend.workflow.ts";
import { RecipesInitPhase4WorkflowDefinition } from "./recipes-init-phase-4.workflow.ts";
import { RecipesInitM4bNoteFilesFrontendWorkflowDefinition } from "./recipes-init-m4b-note-files-frontend.workflow.ts";
import { RecipesInitPhase5WorkflowDefinition } from "./recipes-init-phase-5.workflow.ts";
import { RecipesInitM5bMenusAppWorkflowDefinition } from "./recipes-init-m5b-menus-app.workflow.ts";
import { RecipesInitM5cMenusRootWorkflowDefinition } from "./recipes-init-m5c-menus-root.workflow.ts";
import path from "path";

const input = [] as const;
interface RecipesInitWorkflowContext {}

export const RecipesInitWorkflowDefinition = defineWorkflow<
  typeof input,
  RecipesInitWorkflowContext
>({
  id: "plans/recipes-init",
  description:
    "Orchestrator: run all recipes-init workflows in milestone order (each can use a different agent).",
  input,
  context: ({ input }) => ({
    agentConfig: {
      ...input.agentConfig,
      resetTimeoutEachStep: true,
    },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "recipes-init.spec.md"),
    plan: path.join(import.meta.dirname, "recipes-init.plan.md"),
  },
  versionControl: {
    allowPaths: ["**/*"],
    commitEachStep: true,
  },
  steps: [
    step(makeWorkflowMachine(RecipesInitPhase1WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase1bWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase1cWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1aAppRecipesWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1bRootRecipesWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1cVersionsWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase2WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM2bNotesFrontendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase3WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM3bRecipeFilesFrontendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase4WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM4bNoteFilesFrontendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitPhase5WorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM5bMenusAppWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM5cMenusRootWorkflowDefinition), () => ({})),
  ],
});

export default RecipesInitWorkflowDefinition;
