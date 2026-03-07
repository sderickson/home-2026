import { describe, it, expect } from "vitest";
import { stubGlobals, mountWithPlugins } from "@saflib/vue/testing";
import RecipeFilesDisplay from "./RecipeFilesDisplay.vue";
import { root_strings } from "../../../strings.ts";

describe("RecipeFilesDisplay", () => {
  stubGlobals();

  it("renders section heading and empty state when no files", () => {
    const wrapper = mountWithPlugins(RecipeFilesDisplay, {
      props: { files: [] },
    }, {
      i18nMessages: { ...root_strings },
    });

    expect(wrapper.text()).toContain("Recipe files");
    expect(wrapper.text()).toContain("No files attached.");
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
    const wrapper = mountWithPlugins(RecipeFilesDisplay, {
      props: { files },
    }, {
      i18nMessages: { ...root_strings },
    });

    expect(wrapper.text()).toContain("Recipe files");
    expect(wrapper.find(".v-carousel").exists()).toBe(true);
    expect(wrapper.findAll(".v-window-item").length).toBe(1);
    wrapper.unmount();
  });
});
