import { HandledDatabaseError } from "@saflib/drizzle";

/**
 * Superclass for all handled hub db errors
 */
export class HubDatabaseError extends HandledDatabaseError {}

// TODO: Add specific error classes for your database
export class StubError extends HubDatabaseError {}
