/**
 * Milestone 1 — Menus backend (http): Express handlers for menu CRUD and
 * extend recipe get handler for menuId.
 * Packages: recipes/service/http.
 * Run from recipes/plans so Cd paths resolve (e.g. ../service/http).
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
  PromptStepMachine,
} from "@saflib/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM1HttpWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/menus-m1-http",
  description:
    "Menus backend (http): Menu CRUD handlers; collection role checks; recipeIds-in-collection validation; editedByUserIds append on PUT; extend recipe get for menuId.",
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
    step(CdStepMachine, () => ({ path: "../service/http" })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), ({ context }) => ({
      path: "./routes/menus/list.ts",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 1: menus backend — http handlers). Then: Handler for GET /menus. (a) When collectionId query present: caller must be at least viewer on that collection; use list-by-collection-id; if caller is viewer, filter to public menus only; if editor/owner, return all. (b) When publicOnly=true (no collectionId): use list-public query; no auth required. Response: { menus: Menu[] }. See spec API #1 and "GET /menus (public)".`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/get.ts",
      prompt: `Handler for GET /menus/:id. When collectionId query present: caller must be at least viewer on collection; menu must belong to that collection; if viewer, menu must be public. When no collectionId (public detail): allow only if menu is public. Load menu; load all recipes referenced in menu groupings (same collection); return { menu, recipes: Recipe[] } — flat array of full recipe objects for display. Validate recipeIds in groupings belong to menu's collection. See spec API #2.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/create.ts",
      prompt: `Handler for POST /menus. Body: collectionId, name, isPublic, groupings. Caller must be editor or owner on collection. Validate every recipeId in groupings belongs to the same collection. Use menu create query; set editedByUserIds to [caller id]. Response: { menu: Menu }. See spec API #3.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/update.ts",
      prompt: `Handler for PUT /menus/:id. Body: collectionId, name, isPublic, groupings. Caller must be editor or owner on collection; menu must belong to collection. Validate recipeIds in groupings belong to collection. Append current user id to editedByUserIds if not already present, then update. Response: { menu: Menu }. See spec API #4.`,
    })),

    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/delete.ts",
      prompt: `Handler for DELETE /menus/:id. Query or body: collectionId. Caller must be editor or owner on collection; menu must belong to collection. Use menu delete query. See spec API #5.`,
    })),

    step(PromptStepMachine, () => ({
      promptText: `Extend GET /recipes/:id (the handler and route already exist — edit them; do not run add-handler): (1) Add optional query param menuId to recipes/service/spec/routes/recipes/get.yaml. (2) Update recipes/service/http/routes/recipes/get.ts so that when menuId is provided, load the menu; if menu is public and its groupings include this recipe id, return the recipe even if the recipe itself is private. See spec "Recipe API (extend existing)". When done, continue the workflow.`,
    })),

    GetFeedbackStep,
  ],
});

export default MenusM1HttpWorkflowDefinition;
