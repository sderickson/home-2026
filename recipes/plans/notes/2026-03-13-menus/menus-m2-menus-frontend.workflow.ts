/**
 * Milestone 2 — Menus frontend: SDK for menus + Menus page (list, create, edit) under /c/:collectionId/menus.
 * Packages: recipes/service/sdk, recipes/clients/app.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import {
  AddSdkQueryWorkflowDefinition,
  AddSdkMutationWorkflowDefinition,
} from "@saflib/sdk/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const MenusM2MenusFrontendWorkflowDefinition = defineWorkflow<
  typeof input,
  Context
>({
  id: "plans/menus-m2-menus-frontend",
  description:
    "Menus frontend: SDK menu queries/mutations + Menus page (list, create, edit) under /c/:collectionId/menus.",
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
    step(CdStepMachine, () => ({ path: "../service/sdk" })),

    step(
      makeWorkflowMachine(AddSdkQueryWorkflowDefinition),
      ({ context }) => ({
        path: "./requests/menus/list.ts",
        urlPath: "/menus",
        method: "get",
        prompt: `Orientation: Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Understand your part (Milestone 2: menus frontend — SDK + pages). Then: Add query for GET /menus with collectionId as query param (collection-scoped list). Response: { menus: Menu[] }.`,
      }),
    ),

    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/menus/get.ts",
      urlPath: "/menus/{id}",
      method: "get",
      prompt: `Add query for GET /menus/:id with collectionId query param. Response: { menu: Menu, recipes: Recipe[] }.`,
    })),

    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/create.ts",
      urlPath: "/menus",
      method: "post",
      prompt: `Add mutation POST /menus. Body: collectionId, name, isPublic, groupings. Response: { menu: Menu }.`,
    })),

    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/update.ts",
      urlPath: "/menus/{id}",
      method: "put",
      prompt: `Add mutation PUT /menus/:id. Body: collectionId, name, isPublic, groupings. Response: { menu: Menu }.`,
    })),

    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/delete.ts",
      urlPath: "/menus/{id}",
      method: "delete",
      prompt: `Add mutation DELETE /menus/:id. Pass collectionId (query or body per API).`,
    })),

    step(CdStepMachine, () => ({ path: "../clients/app" })),

    step(
      makeWorkflowMachine(AddSpaViewWorkflowDefinition),
      ({ context }) => ({
        path: "./pages/menus/list",
        urlPath: "/c/:collectionId/menus/list",
        prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 2). Create the Menus list page:
- Under /c/:collectionId/menus/list (add as a child of the existing /c/:collectionId layout in the router, so the child path is "menus/list").
- List all menus in the collection (use list menus query with collectionId from route params). Viewers see public only; editors/owners see all.
- Breadcrumbs: collection name > Menus.
- "Create menu" button links to /c/:collectionId/menus/create.
- Each menu row links to /c/:collectionId/menus/:id (detail/edit). Show menu name and public/private.
- Use SDK listMenusQuery(collectionId).`,
      }),
    ),

    step(
      makeWorkflowMachine(AddSpaViewWorkflowDefinition),
      ({ context }) => ({
        path: "./pages/menus/create",
        urlPath: "/c/:collectionId/menus/create",
        prompt: `Create the New menu page at /c/:collectionId/menus/create (child of /c/:collectionId layout, path "menus/create").
- Form: name, isPublic (toggle), groupings. Groupings = array of { name (e.g. "Mains"), recipeIds (ordered array of recipe ids) }. Allow adding/removing grouping rows; for recipeIds use a multi-select or search of recipes in the collection (use existing list recipes query for this collection).
- On submit: createMenu mutation with collectionId from route, then navigate to /c/:collectionId/menus/list or to the new menu detail.
- Breadcrumbs: collection > Menus > New menu.
- Editor/owner only (or show form only when user is editor/owner).`,
      }),
    ),

    step(
      makeWorkflowMachine(AddSpaViewWorkflowDefinition),
      ({ context }) => ({
        path: "./pages/menus/detail",
        urlPath: "/c/:collectionId/menus/:id",
        prompt: `Create the Menu detail/edit page at /c/:collectionId/menus/:id (child of /c/:collectionId layout, path "menus/:id").
- Load menu with get menu query (collectionId + id). Response includes menu and recipes array; render groupings with recipe names/short descriptions from the recipes array.
- When user is editor/owner: show Edit button or inline edit (name, isPublic, groupings). Save with updateMenu mutation. Delete button with deleteMenu mutation then redirect to list.
- Breadcrumbs: collection > Menus > [menu name].
- Read-only for viewers (no edit/delete).`,
      }),
    ),

    GetFeedbackStep,
  ],
});

export default MenusM2MenusFrontendWorkflowDefinition;
