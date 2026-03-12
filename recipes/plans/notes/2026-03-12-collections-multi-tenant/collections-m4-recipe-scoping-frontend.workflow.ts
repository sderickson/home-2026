/**
 * Milestone 4 — Recipe scoping frontend: update routes, links, breadcrumbs,
 * SDK usage to pass collectionId from route params to API calls.
 * Packages: recipes/clients/links, recipes/clients/app, recipes/service/sdk.
 * Run from recipes/plans so Cd paths resolve.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
  PromptStepMachine,
} from "@saflib/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;
interface Context {}

export const CollectionsM4RecipeScopingFrontendWorkflowDefinition =
  defineWorkflow<typeof input, Context>({
    id: "plans/collections-m4-recipe-scoping-frontend",
    description:
      "Recipe scoping frontend: /c/:collectionId/ routes, updated links, breadcrumbs with collection name, SDK passes collectionId.",
    input,
    context: ({ input }) => ({
      agentConfig: { ...input.agentConfig, resetTimeoutEachStep: true },
    }),
    sourceUrl: import.meta.url,
    templateFiles: {},
    docFiles: {
      spec: path.join(import.meta.dirname, "collections-multi-tenant.spec.md"),
      plan: path.join(import.meta.dirname, "collections-multi-tenant.plan.md"),
    },
    versionControl: { allowPaths: ["**/*"], commitEachStep: true },
    steps: [
      step(CdStepMachine, () => ({ path: "../clients/links" })),

      step(PromptStepMachine, ({ context }) => ({
        promptText: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 4).

Update app-links.ts: move all recipe-related paths under /c/:collectionId/. For example:
- recipesList: /c/:collectionId/recipes/list
- recipesDetail: /c/:collectionId/recipes/:id
- recipesCreate: /c/:collectionId/recipes/create
- recipesEdit: /c/:collectionId/recipes/:id/edit

Keep the home link and any non-recipe links as-is. Add a collectionsHome link at /collections if not already present (from M2).`,
      })),

      step(CdStepMachine, () => ({ path: "../service/sdk" })),

      step(PromptStepMachine, ({ context }) => ({
        promptText: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 4).

Only two SDK requests need collectionId added:
- **GET /recipes (list query)**: Accept collectionId and pass it as a query parameter — there is no recipe ID, so the backend needs it to know which collection to list.
- **POST /recipes (create mutation)**: Accept collectionId and include it in the request body — the recipe does not exist yet.

All other recipe SDK hooks (get, update, delete, versions, notes, files, note-files) do NOT need collectionId. The backend looks up the collection from the recipe's DB row. Do not modify those hooks.`,
      })),

      step(CdStepMachine, () => ({ path: "../clients/app" })),

      step(PromptStepMachine, ({ context }) => ({
        promptText: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan} (Milestone 4).

Update the app router and pages for collection-scoped recipe routes:

1. **Router**: Add a route group or layout under /c/:collectionId/ that provides the collectionId to child routes. Recipe list, detail, create, and edit pages are now children of this layout. The Collections page (/collections) stays at the top level.

2. **Recipe list page**: Now at /c/:collectionId/recipes/list. Loader reads collectionId from route params and passes it to GET /recipes?collectionId=... SDK query. Page title or breadcrumb shows the collection name (fetch with GET /collections/:id).

3. **Recipe detail page**: Now at /c/:collectionId/recipes/:id. Pass collectionId to all API calls (get recipe, notes, files, etc.). Breadcrumb: collection name > recipe title.

4. **Recipe create/edit pages**: Now at /c/:collectionId/recipes/create and /c/:collectionId/recipes/:id/edit. Pass collectionId in create/update mutations.

5. **Navigation**: From Collections page, clicking a collection links to /c/:collectionId/recipes/list. Within a collection, "back" or breadcrumb goes to collection recipe list. Top-level nav has a link to /collections.

6. **Breadcrumbs**: Replace generic "Recipes" with the collection name. Pattern: Collections > [Collection Name] > Recipe List, or Collections > [Collection Name] > [Recipe Title].

7. **Permissions**: If user's role is viewer, hide create/edit/delete UI in recipe pages (already enforced server-side, but hide for UX).`,
      })),

      GetFeedbackStep,
    ],
  });

export default CollectionsM4RecipeScopingFrontendWorkflowDefinition;
