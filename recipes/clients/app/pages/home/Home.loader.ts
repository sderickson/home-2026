import { getProfile } from "@saflib/auth";
import { useQuery } from "@tanstack/vue-query";

export function useHomeLoader() {
  return {
    profileQuery: useQuery(getProfile()),
  };
}
