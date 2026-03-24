import { useKratosSession } from "@sderickson/recipes-sdk";

export function useVerifyWallLoader() {
  return {
    sessionQuery: useKratosSession(),
  };
}
