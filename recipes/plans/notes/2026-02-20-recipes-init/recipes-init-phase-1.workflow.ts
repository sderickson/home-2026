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
import {
  AddSchemaWorkflowDefinition,
  AddRouteWorkflowDefinition,
} from "@saflib/openapi/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const RecipesInitPhase1WorkflowDefinition = defineWorkflow<
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
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), ({ context }) => ({
      name: "recipe",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 1: recipes core — spec, db, http for recipe CRUD and versioning). Then: Add Recipe schema per spec: id, title, shortDescription, longDescription (optional), isPublic, createdBy, createdAt, updatedBy, updatedAt; optionally current version id for display. See spec.`,
    })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "recipe-version",
      prompt: `Add RecipeVersion schema. Content shape: ingredients (array of { name, quantity, unit }), instructionsMarkdown (string). Include id, recipeId, content, isLatest, createdBy, createdAt. See docFiles.spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/list.yaml",
      prompt: `GET /recipes — list recipes; public-only for non-admin, admins see private too. See spec API #1.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/get.yaml",
      prompt: `GET /recipes/:id — one recipe with current version, optional notes and file list. See spec API #2.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/create.yaml",
      prompt: `POST /recipes — create recipe (and optional initial version). Admin only. See spec API #4.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/update.yaml",
      prompt: `PUT /recipes/:id — update recipe metadata only. Admin only. See spec API #5.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-list.yaml",
      prompt: `GET /recipes/:id/versions — list version history. See spec API #3.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-latest-update.yaml",
      prompt: `PUT /recipes/:id/versions/latest — update latest version in place. Admin only. See spec API #6.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-create.yaml",
      prompt: `POST /recipes/:id/versions — create new version (history). Admin only. See spec API #7.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/delete.yaml",
      prompt: `DELETE /recipes/:id — delete recipe. Admin only. See spec API #8.`,
    })),
  ],
});

export default RecipesInitPhase1WorkflowDefinition;
