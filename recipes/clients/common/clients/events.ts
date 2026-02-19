import { commonEventLogger, makeProductEventLogger } from "@saflib/vue";
import type { ProductEvent } from "@sderickson/recipes-spec";

export const eventLogger = makeProductEventLogger<ProductEvent>();
eventLogger.onProductEvent(commonEventLogger<ProductEvent>);
