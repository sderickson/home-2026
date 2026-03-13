/**
 * Milestone 1 — Menus backend (spec): OpenAPI schema and routes for menus.
 * Packages: recipes/service/spec.
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
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM1SpecWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/menus-m1-spec",
  description:
    "Menus backend (spec): Menu schema and CRUD routes (GET/POST /menus, GET/PUT/DELETE /menus/:id); collection-scoped and public — OpenAPI.",
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
    step(CdStepMachine, () => ({ path: "../service/spec" })),

    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), ({ context }) => ({
      name: "menu",
      prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand the overall plan and your part (Milestone 1: menus backend — spec). Then: Add Menu schema per spec: id, collectionId, name, isPublic, createdBy, createdAt, updatedBy, updatedAt, editedByUserIds (array of strings), groupings (array of { name: string, recipeIds: string[] }).`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/list.yaml",
      urlPath: "/menus",
      method: "get",
      prompt: `GET /menus — (a) Collection-scoped: query param collectionId; list menus in that collection. Viewers see public only; editors/owners see all. Response: { menus: Menu[] }. (b) Public (root app): query param publicOnly=true, no collectionId; return all public menus across collections. Response: { menus: Menu[] }. Auth: collection-scoped requires at least viewer on collection; publicOnly requires no auth. See spec API #1 and "GET /menus (public)".`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/get.yaml",
      urlPath: "/menus/{id}",
      method: "get",
      prompt: `GET /menus/:id — Get one menu. Optional query collectionId (when in collection context). Response: { menu: Menu, recipes: Recipe[] } — menu with groupings; recipes is a flat array of full Recipe objects for every recipe in the menu's groupings (enough to render the menu; reuse existing Recipe schema). When no collectionId (public detail), allow if menu is public. See spec API #2.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/create.yaml",
      urlPath: "/menus",
      method: "post",
      prompt: `POST /menus — Create menu in a collection. Body: collectionId, name, isPublic, groupings (array of { name, recipeIds }). Response: { menu: Menu }. Editor or owner on collection only. Validate recipeIds in groupings belong to same collection. See spec API #3.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/update.yaml",
      urlPath: "/menus/{id}",
      method: "put",
      prompt: `PUT /menus/:id — Update menu name, isPublic, groupings. Body: collectionId, name, isPublic, groupings. On edit, append current user id to editedByUserIds if not present. Response: { menu: Menu }. Editor or owner on collection; menu must belong to collection. Validate recipeIds in groupings. See spec API #4.`,
    })),

    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/delete.yaml",
      urlPath: "/menus/{id}",
      method: "delete",
      prompt: `DELETE /menus/:id — Delete menu. Query or body: collectionId when not inferred. Editor or owner on collection; menu must belong to collection. See spec API #5.`,
    })),

    GetFeedbackStep,
  ],
});

export default MenusM1SpecWorkflowDefinition;
