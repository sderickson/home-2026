/**
 * Unsplash for recipes: Phase 1 (backend) + Phase 2 (frontend).
 * See unsplash.spec.md and unsplash.plan.md.
 */
import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
  PromptStepMachine,
} from "@saflib/workflows";
import {
  AddSchemaWorkflowDefinition,
  AddRouteWorkflowDefinition,
} from "@saflib/openapi/workflows";
import {
  UpdateSchemaWorkflowDefinition,
} from "@saflib/drizzle/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
import {
  AddSdkQueryWorkflowDefinition,
  AddSdkMutationWorkflowDefinition,
} from "@saflib/sdk/workflows";
import { GetFeedbackStep } from "@saflib/processes/workflows";
import path from "path";

const input = [] as const;

interface UnsplashWorkflowContext {
  docFiles?: { spec: string; plan: string };
}

export const UnsplashWorkflowDefinition = defineWorkflow<
  typeof input,
  UnsplashWorkflowContext
>({
  id: "plans/unsplash",
  description: "Unsplash images for recipes: API, DB, handlers, SDK, then frontend picker and attribution",
  input,
  context: ({ input }) => ({
    agentConfig: { ...input.agentConfig },
    docFiles: {
      spec: path.join(import.meta.dirname, "unsplash.spec.md"),
      plan: path.join(import.meta.dirname, "unsplash.plan.md"),
    },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "unsplash.spec.md"),
    plan: path.join(import.meta.dirname, "unsplash.plan.md"),
  },

  versionControl: {
    allowPaths: ["**/*"],
    commitEachStep: true,
  },

  steps: [
    // --- OpenAPI: schemas and routes (cwd: recipes/service/spec) ---
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), ({ context }) => ({
      name: "unsplash-photo-search-item",
      prompt: `Read ${context.docFiles!.spec} and ${context.docFiles!.plan}. Add schema UnsplashPhotoSearchItem: id, thumbUrl, regularUrl, downloadLocation (all strings; URLs as format: uri).`,
    })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "add-recipe-file-from-unsplash-request",
      prompt: `Add schema AddRecipeFileFromUnsplashRequest: unsplashPhotoId, downloadLocation, imageUrl (strings; URL fields format: uri). See spec.`,
    })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "unsplash-attribution",
      prompt: `Add schema UnsplashAttribution: photographerName, photographerProfileUrl, unsplashSourceUrl (strings; URL fields format: uri). For display when showing Unsplash-sourced recipe files. See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/unsplash-photos/search.yaml",
      urlPath: "/unsplash-photos/search",
      method: "get",
      prompt: `Add route GET /unsplash-photos/search. Query params: q (required), perPage (optional, default 10). Response: { unsplashPhotos: UnsplashPhotoSearchItem[] }. See spec and plan.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/files-from-unsplash.yaml",
      urlPath: "/recipes/{id}/files/from-unsplash",
      method: "post",
      prompt: `Add route POST /recipes/:id/files/from-unsplash. Request body: AddRecipeFileFromUnsplashRequest. Response: RecipeFileInfo. See spec. Then extend RecipeFileInfo in schemas/recipe-file-info.yaml with optional unsplashAttribution ($ref UnsplashAttribution) so file responses can include attribution.`,
    })),

    // --- DB: add unsplash_user to recipe_file (cwd: recipes/service/db) ---
    step(CdStepMachine, () => ({ path: "../service/db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), ({ context }) => ({
      path: "./schemas/recipe-file.ts",
      prompt: `Read ${context.docFiles!.spec}. Add column unsplash_user (JSON, nullable) to recipe_file table. Store full Unsplash user object when file is from Unsplash; null otherwise. Use appropriate Drizzle/SQLite JSON type.`,
    })),

    // --- HTTP handlers (cwd: recipes/service/http) ---
    step(CdStepMachine, () => ({ path: "../service/http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/unsplash-photos/search.ts",
      prompt: `Implement GET /unsplash-photos/search. Use unsplash.search.getPhotos({ query: q, perPage }) from recipes/service/integrations/unsplash. Map results to UnsplashPhotoSearchItem[] and return { unsplashPhotos }. Register route (e.g. router.get("/unsplash-photos/search", ...)). Same auth as recipe file upload (admin). See spec and plan.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/files-from-unsplash.ts",
      prompt: `Implement POST /recipes/:id/files/from-unsplash. Body: unsplashPhotoId, downloadLocation, imageUrl. (1) unsplash.photos.get(unsplashPhotoId) for full photo + user, (2) unsplash.photos.trackDownload(downloadLocation), (3) fetch image at imageUrl, (4) insert recipe_file with unsplash_user = full user object and upload bytes to Azure (same as files-upload), (5) return RecipeFileInfo. In _helpers.ts recipeFileToApiRecipeFile: when row.unsplash_user is present, add unsplashAttribution (photographerName, photographerProfileUrl + ?utm_source=APP_NAME&utm_medium=referral, unsplashSourceUrl). Ensure files list handler returns attribution too. See spec and plan.`,
    })),

    // --- SDK (cwd: recipes/service/sdk) ---
    step(CdStepMachine, () => ({ path: "../service/sdk" })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/unsplash-photos/search.ts",
      urlPath: "/unsplash-photos/search",
      method: "get",
      prompt: `Add query for GET /unsplash-photos/search. Query params q and optional perPage. Same auth as recipe file operations. See plan.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/files-from-unsplash.ts",
      urlPath: "/recipes/{id}/files/from-unsplash",
      method: "post",
      prompt: `Add mutation for POST /recipes/:id/files/from-unsplash. Sends JSON body (unsplashPhotoId, downloadLocation, imageUrl). Returns RecipeFileInfo (with unsplashAttribution when applicable). See plan.`,
    })),

    // --- Phase 2: Frontend — picker dialog, menu, attribution (cwd: recipes/clients/app) ---
    step(CdStepMachine, () => ({ path: "../../clients/app" })),
    step(PromptStepMachine, ({ context }) => ({
      promptText: `Phase 2 (frontend). Read ${context.docFiles!.spec} and ${context.docFiles!.plan} Phase 2.

1. **Unsplash picker dialog**: Add a dialog component (e.g. UnsplashPickerDialog) that receives recipeId and recipeTitle. On open, call GET /unsplash-photos/search?q={recipeTitle}&perPage=10. Show ~10 thumbnails; user selects one; "Add photo" calls POST /recipes/:id/files/from-unsplash with id, downloadLocation, imageUrl (e.g. regularUrl). On success close dialog and invalidate recipe files query.

2. **Recipe detail menu**: Change the existing "add image" toolbar button to a menu: "Upload from computer" (current file input flow) and "Choose from Unsplash" (open the picker dialog).

3. **Attribution**: When the user views an image full-size and the file has unsplashAttribution, show "Photo by [name] on Unsplash" with photographer profile link and Unsplash link (use UTM params: utm_source=your_app_name&utm_medium=referral).`,
    })),

    GetFeedbackStep,
  ],
});

export default UnsplashWorkflowDefinition;
