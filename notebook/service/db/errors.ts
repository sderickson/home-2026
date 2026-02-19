import { HandledDatabaseError } from "@saflib/drizzle";

/**
 * Superclass for all handled notebook db errors
 */
export class NotebookDatabaseError extends HandledDatabaseError {}

// TODO: Add specific error classes for your database
export class StubError extends NotebookDatabaseError {}
