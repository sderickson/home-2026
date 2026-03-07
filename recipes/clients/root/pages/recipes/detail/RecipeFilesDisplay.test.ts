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

  it("renders file link when file has downloadUrl", () => {
    const files = [
      {
        id: "f1",
        fileOriginalName: "recipe.pdf",
        downloadUrl: "/recipes/r1/files/f1/blob",
      },
    ] as const;
    const wrapper = mountWithPlugins(RecipeFilesDisplay, {
      props: { files },
    }, {
      i18nMessages: { ...root_strings },
    });

    expect(wrapper.text()).toContain("Recipe files");
    expect(wrapper.text()).toContain("recipe.pdf");
    const link = wrapper.find('a[href="/recipes/r1/files/f1/blob"]');
    expect(link.exists()).toBe(true);
    expect(link.attributes("target")).toBe("_blank");
    wrapper.unmount();
  });

  it("renders file name without link when downloadUrl missing", () => {
    const files = [
      { id: "f1", fileOriginalName: "notes.txt" },
    ];
    const wrapper = mountWithPlugins(RecipeFilesDisplay, {
      props: { files },
    }, {
      i18nMessages: { ...root_strings },
    });

    expect(wrapper.text()).toContain("notes.txt");
    expect(wrapper.find("a").exists()).toBe(false);
    wrapper.unmount();
  });
});
