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
import path from "path";

const input = [] as const;
interface Context {}

export const RecipesInitPhase1bWorkflowDefinition = defineWorkflow<
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
    step(CdStepMachine, () => ({ path: "../service/db" })),
    step(
      makeWorkflowMachine(UpdateSchemaWorkflowDefinition),
      ({ context }) => ({
        path: "./schemas/recipe.ts",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 1: recipes core — spec, db, http for recipe CRUD and versioning). Then: Add tables recipe and recipe_version per spec. recipe: id, title, short_description, long_description, is_public, created_by, created_at, updated_by, updated_at. recipe_version: id, recipe_id, content (JSON), is_latest, created_by, created_at. Index (recipe_id, is_latest). See docFiles.spec and plan Phase 1.`,
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
  ],
});

export default RecipesInitPhase1bWorkflowDefinition;
