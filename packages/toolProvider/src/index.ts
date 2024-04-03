import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

import { JournalEntrySchema } from "./journal/types";

export const generator = new OpenApiGeneratorV3([JournalEntrySchema]);

export * from "./journal/types";
export { JournalToolProvider } from "./journal";
