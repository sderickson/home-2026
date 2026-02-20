/**
 * Phase 5: Menus — spec, db, http (nested groupings JSON).
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

export const RecipesInitPhase5WorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/recipes-init-phase-5",
  description: "Menus: spec, db, http (nested groupings).",
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
      name: "menu",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Make sure you understand the overall plan and your part in it (Phase 5: menus — spec, db, http with nested groupings JSON). Then: Add Menu schema: id, name, isPublic, createdBy, createdAt, editedByUserIds (array), groupings (array of { name, recipeIds }). See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/list.yaml",
      prompt: `GET /menus. See spec API #19.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/get.yaml",
      prompt: `GET /menus/:id. See spec API #20.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/create.yaml",
      prompt: `POST /menus. Admin only. See spec API #21.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/update.yaml",
      prompt: `PUT /menus/:id; append current user to editedByUserIds if new. Admin only. See spec API #22.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/delete.yaml",
      prompt: `DELETE /menus/:id. Admin only. See spec API #23.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/menu.ts",
      prompt: `Add table menus: id, name, is_public, created_by, created_at, edited_by_user_ids (JSON), groupings (JSON). Queries list, get, create, update, delete. On update append user id to edited_by_user_ids.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/list.ts",
      prompt: `List menus (public filter for non-admin).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/get.ts",
      prompt: `Get menu by id.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/create.ts",
      prompt: `Create menu.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/update.ts",
      prompt: `Update menu; append current user to editedByUserIds if not present.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/delete.ts",
      prompt: `Delete menu.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/list.ts",
      prompt: `Handler GET /menus.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/get.ts",
      prompt: `Handler GET /menus/:id.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/create.ts",
      prompt: `Handler POST /menus. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/update.ts",
      prompt: `Handler PUT /menus/:id. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/delete.ts",
      prompt: `Handler DELETE /menus/:id. Admin only.`,
    })),
  ],
});

export default RecipesInitPhase5WorkflowDefinition;
