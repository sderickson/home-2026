import { describe, it, expect } from "vitest";
import { stubGlobals, getElementByString } from "@saflib/vue/testing";
import RecipeFilesDisplay from "./RecipeFilesDisplay.vue";
import { recipe_files_display_strings as strings } from "./RecipeFilesDisplay.strings.ts";
import { mountTestApp } from "../../test-app.ts";

describe("RecipeFilesDisplay", () => {
  stubGlobals();

  it("renders section heading and empty state when no files", () => {
    const wrapper = mountTestApp(RecipeFilesDisplay, {
      props: { files: [] },
    });

    expect(getElementByString(wrapper, strings.files_section).exists()).toBe(
      true,
    );
    expect(getElementByString(wrapper, strings.no_files).exists()).toBe(true);
    wrapper.unmount();
  });

  it("renders carousel when files are present", () => {
    const files = [
      {
        id: "f1",
        fileOriginalName: "recipe.pdf",
        downloadUrl: "/recipes/r1/files/f1/blob",
      },
    ];
    const wrapper = mountTestApp(RecipeFilesDisplay, {
      props: { files },
    });

    expect(getElementByString(wrapper, strings.files_section).exists()).toBe(
      true,
    );
    expect(wrapper.find(".v-carousel").exists()).toBe(true);
    expect(wrapper.findAll(".v-window-item").length).toBe(1);
    wrapper.unmount();
  });
});
