/**
 * Milestone 1 — Menus backend (db): Drizzle schema for menu table and queries.
 * Packages: recipes/service/db.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/db).
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
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM1DbWorkflowDefinition = defineWorkflow<typeof input, Context>({
  id: "plans/menus-m1-db",
  description:
    "Menus backend (db): menu table (collection_id, name, is_public, groupings JSON, edited_by_user_ids JSON, etc.); migration and queries — Drizzle.",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "menus.spec.md"),
    plan: path.join(import.meta.dirname, "menus.plan.md"),
  },
  versionControl: { allowPaths: ["**/*"], commitEachStep: true },
  steps: [
    step(CdStepMachine, () => ({ path: "../service/db" })),

    step(
      makeWorkflowMachine(UpdateSchemaWorkflowDefinition),
      ({ context }) => ({
        path: "./schemas/menu.ts",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand the overall plan and your part (Milestone 1: menus backend — db). Then: Add menu table in this file: id (PK), collection_id (FK to collection, required), name, is_public, created_by, created_at, updated_by, updated_at, edited_by_user_ids (JSON array of user ids), groupings (JSON — array of { name: string, recipeIds: string[] }). Index on collection_id for listing. Follow existing patterns from collection and recipe schemas.`,
      }),
    ),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menu/list-by-collection-id.ts",
      prompt: `List menus by collection_id. Filter by is_public when caller is viewer (caller role is application concern); this query can return all menus for the collection and let the handler filter, or accept an optional filter. Prefer returning all for the collection; handler applies viewer vs editor/owner visibility.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menu/list-public.ts",
      prompt: `List all public menus (is_public = true) across all collections. Used by root app for GET /menus?publicOnly=true. No collection filter.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menu/get-by-id.ts",
      prompt: `Get one menu by id. Return null if not found.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menu/create.ts",
      prompt: `Create a menu. Accept collection_id, name, is_public, created_by, groupings (JSON), edited_by_user_ids (default [created_by]). Return the created menu.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menu/update.ts",
      prompt: `Update a menu by id. Accept name, is_public, groupings, and optionally updated_by. When appending to edited_by_user_ids, the handler will pass the new array; this query can accept edited_by_user_ids as a full replacement. Return updated menu.`,
    })),

    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menu/delete.ts",
      prompt: `Delete a menu by id.`,
    })),

    GetFeedbackStep,
  ],
});

export default MenusM1DbWorkflowDefinition;
