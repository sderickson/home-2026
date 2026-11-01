// keep form, layout, and display components shared across SPAs in this folder, and re-export them from here
export { default as NotebookLayout } from "./notebook-layout/NotebookLayout.vue";
export { default as DynamicNotebookLayout } from "./notebook-layout/DynamicNotebookLayout.vue";
export { default as NotebookAsyncPageError } from "./NotebookAsyncPageError.vue";
export {
  baseAccessErrorAction,
  baseVerifyEmailHref,
  isEmailVerificationRequiredError,
  resolveNotebookAccessErrorKind,
} from "#utils/access-error.logic.ts";
export type { NotebookAccessErrorKind } from "#utils/access-error.logic.ts";
