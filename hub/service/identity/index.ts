import { startOryKratosService } from "@saflib/ory-kratos";
import { callbacks } from "./callbacks.ts";

export { callbacks };

/** @deprecated Prefer importing {@link startOryKratosService} from `@saflib/ory-kratos` directly. */
export const startHubIdentityService = () => {
  startOryKratosService({ callbacks });
};
