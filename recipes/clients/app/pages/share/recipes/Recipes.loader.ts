// TODO: replace with actual queries this page will need on load
import { useKratosSession } from "@saflib/ory-kratos-sdk";

export function useRecipesLoader() {
  // TODO: Add tanstack query calls here and return each query result in the array
  return {
    sessionQuery: useKratosSession(),
  };
}
