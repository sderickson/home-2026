import { linkToProps } from "@saflib/links";
import { appLinks as recipesAppLinks } from "@sderickson/recipes-links";

/** Props for a hub app CTA to the recipes SPA home (`app.recipes`). */
export function getRecipesHomeLinkProps() {
  return linkToProps(recipesAppLinks.home);
}
