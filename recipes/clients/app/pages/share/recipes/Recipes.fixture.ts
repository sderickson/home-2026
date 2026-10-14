import type { Page } from "@playwright/test";
import { getByString } from "@saflib/playwright";
import { share_recipes as strings } from "./Recipes.strings.ts";

export class ShareRecipesPageFixture {
  constructor(private page: Page) {}

  async expectRecipeTitle(title: string): Promise<void> {
    await this.page.getByRole("heading", { name: title }).waitFor();
  }

  async expectNotFound(): Promise<void> {
    await getByString(this.page, strings.not_found_title).waitFor();
  }
}
