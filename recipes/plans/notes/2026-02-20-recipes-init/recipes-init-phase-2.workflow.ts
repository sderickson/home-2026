/**
 * Phase 2: Recipe notes — spec, db, http.
 * Packages: recipes/service/spec, recipes/service/db, recipes/service/http.
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
import {
  UpdateSchemaWorkflowDefinition,
  AddDrizzleQueryWorkflowDefinition,
} from "@saflib/drizzle/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const RecipesInitPhase2WorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-2",
  description: "Recipe notes: spec, db, http (notes CRUD).",
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
      name: "recipe-note",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 2: recipe notes — spec, db, http for notes CRUD). Then: Add RecipeNote schema: id, recipeId, recipeVersionId (optional), body, everEdited, createdBy, createdAt, updatedBy, updatedAt. See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-list.yaml",
      prompt: `GET /recipes/:id/notes — list notes for recipe. See spec API #9.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-create.yaml",
      prompt: `POST /recipes/:id/notes — create note. Admin only. See spec API #10.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-update.yaml",
      prompt: `PUT /recipes/:id/notes/:noteId — edit note; set everEdited. Admin only. See spec API #11.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-delete.yaml",
      prompt: `DELETE /recipes/:id/notes/:noteId. Admin only. See spec API #12.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipe-note.ts",
      prompt: `Add table recipe_notes: id, recipe_id, recipe_version_id (nullable), body, ever_edited, created_by, created_at, updated_by, updated_at. Add queries for list, create, update, delete.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/list.ts",
      prompt: `List notes for a recipe.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/create.ts",
      prompt: `Create recipe note.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/update.ts",
      prompt: `Update note body; set ever_edited to true.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/delete.ts",
      prompt: `Delete recipe note.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-list.ts",
      prompt: `Handler GET /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-create.ts",
      prompt: `Handler POST /recipes/:id/notes. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-update.ts",
      prompt: `Handler PUT /recipes/:id/notes/:noteId. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-delete.ts",
      prompt: `Handler DELETE /recipes/:id/notes/:noteId. Admin only.`,
    })),
  ],
});

export default RecipesInitPhase2WorkflowDefinition;
