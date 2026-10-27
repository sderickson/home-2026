import createError from "http-errors";
import {
  HTML_NOT_ALLOWED_CODE,
  valueContainsDisallowedHtml,
} from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { sanitizeMarkdownOnServer } from "@sderickson/recipes-markdown/server";

type VersionContent = {
  ingredients: { name: string; quantity: string; unit: string }[];
  instructionsMarkdown: string;
};

export type RemovedHtml =
  RecipesServiceResponseBody["createRecipeVersion"][200]["removedHtml"];

/**
 * Throw a 400 if any of `fields` has HTML. The save routes are
 * `block-html-exempt` so instructions can carry markdown HTML; this keeps the
 * old blanket check for everything else.
 */
export function assertNoHtml(fields: Record<string, unknown>): void {
  for (const [name, value] of Object.entries(fields)) {
    if (valueContainsDisallowedHtml(value)) {
      throw createError(400, `HTML is not allowed in ${name}`, {
        code: HTML_NOT_ALLOWED_CODE,
      });
    }
  }
}

/**
 * Reject HTML in ingredients and strip disallowed HTML from the instructions.
 * Returns the content to store and what was removed, for the response.
 */
export function sanitizeVersionContent(content: VersionContent): {
  content: VersionContent;
  removedHtml: RemovedHtml;
} {
  assertNoHtml({ ingredients: content.ingredients });
  const { markdown, removed } = sanitizeMarkdownOnServer(
    content.instructionsMarkdown ?? "",
  );
  return {
    content: { ...content, instructionsMarkdown: markdown },
    removedHtml: removed,
  };
}
