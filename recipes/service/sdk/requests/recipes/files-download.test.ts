import { describe, it, expect } from "vitest";
import { useQuery } from "@tanstack/vue-query";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { filesDownloadRecipesQuery } from "./files-download.ts";

describe("filesDownloadRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);

  it("returns blob bytes from the mock handler", async () => {
    const [result, app] = withVueQuery(() =>
      useQuery(filesDownloadRecipesQuery("r1", "f1")),
    );
    await result.suspense();
    expect(result.data.value).toBeInstanceOf(Blob);
    app.unmount();
  });
});
