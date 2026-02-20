/**
 * Phase 4: Recipe note files — list, upload, delete. Spec, db, http.
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

export const RecipesInitPhase4WorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-4",
  description: "Recipe note files: list, upload, delete.",
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
      name: "recipe-note-file-info",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 4: recipe note files — list, upload, delete). Then: Add RecipeNoteFileInfo schema (file metadata per SAF). See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-list.yaml",
      prompt: `GET /recipes/:id/notes/:noteId/files. See spec API #16.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-upload.yaml",
      upload: true,
      prompt: `POST /recipes/:id/notes/:noteId/files. Admin only. See spec API #17.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-delete.yaml",
      prompt: `DELETE /recipes/:id/notes/:noteId/files/:fileId. Admin only. See spec API #18.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipe-note-file.ts",
      file: true,
      prompt: `Add table recipe_note_files: id, recipe_note_id, ...fileMetadataColumns. Queries list, insert, delete.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-note-files/list.ts",
      prompt: `List files for a note.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-note-files/insert.ts",
      prompt: `Insert note file row.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-note-files/delete.ts",
      prompt: `Delete note file by id.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-list.ts",
      prompt: `Handler GET /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-upload.ts",
      upload: true,
      prompt: `Handler POST /recipes/:id/notes/:noteId/files. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-delete.ts",
      prompt: `Handler DELETE /recipes/:id/notes/:noteId/files/:fileId. Admin only.`,
    })),
  ],
});

export default RecipesInitPhase4WorkflowDefinition;
