import { linkToProps } from "@saflib/links";
import { appLinks as recipesAppLinks } from "@sderickson/recipes-links";
import { appLinks as notebookAppLinks } from "@sderickson/notebook-links";

/** Props for a hub app CTA to the recipes SPA home (`app.recipes`). */
export function getRecipesHomeLinkProps() {
  return linkToProps(recipesAppLinks.home);
}

/** Props for a hub app CTA to the notebook SPA home (`app.notebook`). */
export function getNotebookHomeLinkProps() {
  return linkToProps(notebookAppLinks.home);
}
