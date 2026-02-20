/**
 * Phase 1: Recipes (core) — OpenAPI spec, Drizzle schema/queries, Express handlers.
 * Packages: recipes/service/spec, recipes/service/db, recipes/service/http.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/spec).
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
import path from "path";
import { GetFeedbackStep } from "@saflib/processes/workflows";

const input = [] as const;
interface Context {}

export const RecipesInitPhase1cWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-1",
  description: "Recipes core: spec, db, http (recipe CRUD + versioning).",
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
    step(CdStepMachine, () => ({ path: "../service/http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), ({ context }) => ({
      path: "./routes/recipes/list.ts",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 1: recipes core — spec, db, http for recipe CRUD and versioning). Then: Handler for GET /recipes. Use list query; enforce public-only for non-admin.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/get.ts",
      prompt: `Handler for GET /recipes/:id. Use get-by-id; return recipe + current version + optional notes/files.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/create.ts",
      prompt: `Handler for POST /recipes. Admin only; use create-with-version.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/update.ts",
      prompt: `Handler for PUT /recipes/:id. Admin only; use update-metadata.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-list.ts",
      prompt: `Handler for GET /recipes/:id/versions. Use versions-list query.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-latest-update.ts",
      prompt: `Handler for PUT /recipes/:id/versions/latest. Admin only; use update-latest-version.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-create.ts",
      prompt: `Handler for POST /recipes/:id/versions. Admin only; use create-version.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/delete.ts",
      prompt: `Handler for DELETE /recipes/:id. Admin only; use delete query.`,
    })),
    GetFeedbackStep,
  ],
});

export default RecipesInitPhase1cWorkflowDefinition;
