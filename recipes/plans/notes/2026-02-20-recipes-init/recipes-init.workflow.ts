/**
 * Orchestrator: runs recipes-init workflows in milestone order.
 * Each workflow can use a different agent (better context fit).
 * Run from recipes/plans so Cd paths (e.g. ../service/spec) resolve.
 *
 * Order: M1 (recipes backend: spec, db, http) → M1a, M1b, M1c (recipes frontend) →
 * M2a (notes backend) → M2b (notes frontend) → M3a (recipe files backend) → M3b, M3c →
 * M4a (note files backend) → M4b.
 */
import { defineWorkflow, step, makeWorkflowMachine } from "@saflib/workflows";
import { RecipesInitM1SpecWorkflowDefinition } from "./recipes-init-m1-spec.workflow.ts";
import { RecipesInitM1DbWorkflowDefinition } from "./recipes-init-m1-db.workflow.ts";
import { RecipesInitM1HttpWorkflowDefinition } from "./recipes-init-m1-http.workflow.ts";
import { RecipesInitM1aAppRecipesWorkflowDefinition } from "./recipes-init-m1a-app-recipes.workflow.ts";
import { RecipesInitM1bRootRecipesWorkflowDefinition } from "./recipes-init-m1b-root-recipes.workflow.ts";
import { RecipesInitM1cVersionsWorkflowDefinition } from "./recipes-init-m1c-versions.workflow.ts";
import { RecipesInitM2aNotesBackendWorkflowDefinition } from "./recipes-init-m2a-notes-backend.workflow.ts";
import { RecipesInitM2bNotesFrontendWorkflowDefinition } from "./recipes-init-m2b-notes-frontend.workflow.ts";
import { RecipesInitM3aRecipeFilesBackendWorkflowDefinition } from "./recipes-init-m3a-recipe-files-backend.workflow.ts";
import { RecipesInitM3bRecipeFilesFrontendWorkflowDefinition } from "./recipes-init-m3b-recipe-files-frontend.workflow.ts";
import { RecipesInitM3cRecipeFilesVisibleWorkflowDefinition } from "./recipes-init-m3c-recipe-files-visible.workflow.ts";
import { RecipesInitM4aNoteFilesBackendWorkflowDefinition } from "./recipes-init-m4a-note-files-backend.workflow.ts";
import { RecipesInitM4bNoteFilesFrontendWorkflowDefinition } from "./recipes-init-m4b-note-files-frontend.workflow.ts";
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
    step(makeWorkflowMachine(RecipesInitM1SpecWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1DbWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1HttpWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1aAppRecipesWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1bRootRecipesWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM1cVersionsWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM2aNotesBackendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM2bNotesFrontendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM3aRecipeFilesBackendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM3bRecipeFilesFrontendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM3cRecipeFilesVisibleWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM4aNoteFilesBackendWorkflowDefinition), () => ({})),
    step(makeWorkflowMachine(RecipesInitM4bNoteFilesFrontendWorkflowDefinition), () => ({})),
  ],
});

export default RecipesInitWorkflowDefinition;
