import { search } from "../calls/search.ts";

const result = await search({ query: "nature", per_page: 3 });
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
console.log(JSON.stringify(result.result, null, 2));
