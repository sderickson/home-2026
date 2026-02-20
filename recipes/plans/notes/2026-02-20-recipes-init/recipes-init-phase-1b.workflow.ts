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
  UpdateSchemaWorkflowDefinition,
  AddDrizzleQueryWorkflowDefinition,
} from "@saflib/drizzle/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
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
    step(CdStepMachine, () => ({ path: "../db" })),
    step(
      makeWorkflowMachine(UpdateSchemaWorkflowDefinition),
      ({ context }) => ({
        path: "./schemas/recipe.ts",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 1: recipes core — spec, db, http for recipe CRUD and versioning). Then: Add tables recipes and recipe_versions per spec. recipes: id, title, short_description, long_description, is_public, created_by, created_at, updated_by, updated_at. recipe_versions: id, recipe_id, content (JSON), is_latest, created_by, created_at. Index (recipe_id, is_latest). See docFiles.spec and plan Phase 1.`,
      }),
    ),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/list.ts",
      prompt: `List recipes; filter by public/admin per spec.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/get-by-id.ts",
      prompt: `Get recipe by id with latest version.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/create-with-version.ts",
      prompt: `Create recipe and first version in a transaction.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/update-metadata.ts",
      prompt: `Update recipe metadata (title, descriptions, is_public).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/update-latest-version.ts",
      prompt: `Update latest version content in place (set content on row where is_latest=true).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/create-version.ts",
      prompt: `Create new version: insert row, set is_latest on new row, clear on previous (transaction).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/delete.ts",
      prompt: `Delete recipe (and versions/notes/files per policy).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe/versions-list.ts",
      prompt: `List versions for a recipe ordered by created_at.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/list.ts",
      prompt: `Handler for GET /recipes. Use list query; enforce public-only for non-admin.`,
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
  ],
});

export default RecipesInitPhase1WorkflowDefinition;
