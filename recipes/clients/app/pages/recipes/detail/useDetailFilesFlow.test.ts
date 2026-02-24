import { afterEach, describe, it, expect } from "vitest";
import { computed } from "vue";
import { useDetailFilesFlow } from "./useDetailFilesFlow.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { withVueQuery } from "@saflib/sdk/testing";
import {
  mockRecipeFiles,
  mockRecipes,
  recipesServiceFakeHandlers,
  resetMocks,
} from "@sderickson/recipes-sdk/fakes";

describe("useDetailFilesFlow", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("upload: submitUploadFile adds file to mock and clears selection", async () => {
    const recipeId = mockRecipes[0].id;
    const countBefore = mockRecipeFiles.filter(
      (f) => f.recipeId === recipeId,
    ).length;
    const [flow, app] = withVueQuery(() =>
      useDetailFilesFlow(computed(() => recipeId)),
    );

    const mockFile = new File(["test content"], "flow-upload-test.txt", {
      type: "text/plain",
    });
    flow.selectedFile.value = mockFile;
    await flow.submitUploadFile();

    expect(mockRecipeFiles.filter((f) => f.recipeId === recipeId)).toHaveLength(
      countBefore + 1,
    );
    expect(flow.selectedFile.value).toBeNull();

    app.unmount();
  });

  it("delete: confirmDeleteFile then doDeleteFile removes file and closes dialog", async () => {
    const recipeId = mockRecipes[0].id;
    const filesForRecipe = mockRecipeFiles.filter((f) => f.recipeId === recipeId);
    const file = filesForRecipe[filesForRecipe.length - 1];
    const fileId = file.id;
    const [flow, app] = withVueQuery(() =>
      useDetailFilesFlow(computed(() => recipeId)),
    );

    flow.confirmDeleteFile(file);
    expect(flow.deleteFileDialogOpen.value).toBe(true);
    expect(flow.fileToDelete.value?.fileId).toBe(fileId);

    await flow.doDeleteFile();

    expect(flow.deleteFileDialogOpen.value).toBe(false);
    expect(flow.fileToDelete.value).toBeNull();
    expect(mockRecipeFiles.some((f) => f.id === fileId)).toBe(false);

    app.unmount();
  });

  it("onFileInputChange sets selectedFile from input", () => {
    const [flow, app] = withVueQuery(() =>
      useDetailFilesFlow(computed(() => mockRecipes[0].id)),
    );
    const mockFile = new File(["x"], "chosen.txt", { type: "text/plain" });
    const input = document.createElement("input");
    Object.defineProperty(input, "files", {
      value: [mockFile],
      writable: false,
    });

    flow.onFileInputChange({ target: input } as unknown as Event);

    expect(flow.selectedFile.value).toBe(mockFile);

    app.unmount();
  });
});
