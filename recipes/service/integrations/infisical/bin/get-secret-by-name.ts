import { getSecretByName } from "../calls/get-secret-by-name.ts";

/** Default secret name for end-to-end verification when no arg is passed (e.g. npm run get-secret-by-name). */
const DEFAULT_SECRET_NAME = "DATABASE_URL";

const name = process.argv[2] ?? DEFAULT_SECRET_NAME;
console.error(`Fetching secret: ${name}`);

const result = await getSecretByName(name);
if ("error" in result && result.error) {
  console.error("Error:", result.error.message);
  process.exit(1);
}
if ("result" in result) {
  console.log(result.result);
}
