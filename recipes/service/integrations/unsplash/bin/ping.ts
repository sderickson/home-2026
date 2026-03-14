import { ping } from "../calls/ping.ts";

const result = await ping();
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
console.log(JSON.stringify(result.result, null, 2));
