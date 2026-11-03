// BEGIN SORTED WORKFLOW AREA schema-exports FOR drizzle/update-schema

// END WORKFLOW AREA

// Product seed table — outside the update-schema area so offshoot upserts
// (which copy this file's area as the template) do not pull it in.
export * from "./schemas/user-config.ts";

// BEGIN WORKFLOW AREA offshoot-schema-exports FOR drizzle/init

// END WORKFLOW AREA
