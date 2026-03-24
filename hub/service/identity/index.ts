import { startOryKratosService } from "@saflib/ory-kratos";
import { callbacks } from "@sderickson/hub-kratos-courier";

export { callbacks };

/** @deprecated Prefer importing {@link startOryKratosService} from `@saflib/ory-kratos` directly. */
export const startHubIdentityService = () => {
  startOryKratosService({ callbacks });
};
