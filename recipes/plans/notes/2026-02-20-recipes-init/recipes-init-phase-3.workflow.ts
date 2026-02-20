/**
 * Phase 3: Recipe files — upload/list/delete (Azure). Spec, db, http.
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

export const RecipesInitPhase3WorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-3",
  description: "Recipe files: list, upload, delete (Azure).",
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
      name: "recipe-file-info",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 3: recipe files — list, upload, delete; Azure). Then: Add RecipeFileInfo schema (file metadata: blob_name, file_original_name, mimetype, size, etc. per SAF fileMetadataColumns). See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/files-list.yaml",
      prompt: `GET /recipes/:id/files — list recipe files. See spec API #13.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/files-upload.yaml",
      upload: true,
      prompt: `POST /recipes/:id/files — upload file (multipart). Admin only. Azure storage. See spec API #14.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/files-delete.yaml",
      prompt: `DELETE /recipes/:id/files/:fileId. Admin only. See spec API #15.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipe-file.ts",
      file: true,
      prompt: `Add table recipe_file: id, recipe_id, ...fileMetadataColumns (from @saflib/drizzle/types/file-metadata), optional uploaded_by. Add queries list, insert, delete.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-file/list.ts",
      prompt: `List files for a recipe.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-file/insert.ts",
      prompt: `Insert recipe file row.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-file/delete.ts",
      prompt: `Delete recipe file by id.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/files-list.ts",
      prompt: `Handler GET /recipes/:id/files.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/files-upload.ts",
      upload: true,
      prompt: `Handler POST /recipes/:id/files (multipart). Admin only; wire to Azure.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/files-delete.ts",
      prompt: `Handler DELETE /recipes/:id/files/:fileId. Admin only.`,
    })),
  ],
});

export default RecipesInitPhase3WorkflowDefinition;
