import { HandledDatabaseError } from "@saflib/drizzle";

/**
 * Superclass for all handled recipes db errors
 */
export class RecipesDatabaseError extends HandledDatabaseError {}

// TODO: Add specific error classes for your database
export class StubError extends RecipesDatabaseError {}

export class RecipeNotFoundError extends RecipesDatabaseError {}

export class RecipeVersionNotFoundError extends RecipesDatabaseError {}

export class RecipeNoteNotFoundError extends RecipesDatabaseError {}

export class RecipeFileNotFoundError extends RecipesDatabaseError {}
