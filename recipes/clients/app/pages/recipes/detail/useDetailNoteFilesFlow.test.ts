import { afterEach, describe, it, expect } from "vitest";
import { computed } from "vue";
import { useDetailNoteFilesFlow } from "./useDetailNoteFilesFlow.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { withVueQuery } from "@saflib/sdk/testing";
import {
  mockRecipeNotes,
  mockRecipeNoteFiles,
  mockRecipes,
  recipesServiceFakeHandlers,
  resetMocks,
} from "@sderickson/recipes-sdk/fakes";

describe("useDetailNoteFilesFlow", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("upload: submitUploadFile adds file to mock and clears selection", async () => {
    const recipeId = mockRecipes[0].id;
    const noteId = mockRecipeNotes[0].id;
    const countBefore = mockRecipeNoteFiles.filter(
      (f) => f.recipeNoteId === noteId,
    ).length;
    const [flow, app] = withVueQuery(() =>
      useDetailNoteFilesFlow(computed(() => recipeId)),
    );

    flow.setUploadTargetNote(noteId);
    const mockFile = new File(["test content"], "flow-upload.txt", {
      type: "text/plain",
    });
    flow.selectedFile.value = mockFile;
    await flow.submitUploadFile();

    expect(
      mockRecipeNoteFiles.filter((f) => f.recipeNoteId === noteId),
    ).toHaveLength(countBefore + 1);
    expect(flow.selectedFile.value).toBeNull();
    expect(flow.uploadTargetNoteId.value).toBeNull();

    app.unmount();
  });

  it("delete: confirmDeleteFile then doDeleteFile removes file and closes dialog", async () => {
    const recipeId = mockRecipes[0].id;
    const file = mockRecipeNoteFiles[0];
    const noteId = file.recipeNoteId;
    const fileId = file.id;
    const [flow, app] = withVueQuery(() =>
      useDetailNoteFilesFlow(computed(() => recipeId)),
    );

    flow.confirmDeleteFile(file);
    expect(flow.deleteNoteFileDialogOpen.value).toBe(true);
    expect(flow.fileToDelete.value?.fileId).toBe(fileId);
    expect(flow.fileToDelete.value?.noteId).toBe(noteId);

    await flow.doDeleteFile();

    expect(flow.deleteNoteFileDialogOpen.value).toBe(false);
    expect(flow.fileToDelete.value).toBeNull();
    expect(mockRecipeNoteFiles.some((f) => f.id === fileId)).toBe(false);

    app.unmount();
  });

  it("onFileInputChange sets selectedFile from input", () => {
    const [flow, app] = withVueQuery(() =>
      useDetailNoteFilesFlow(computed(() => mockRecipes[0].id)),
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
