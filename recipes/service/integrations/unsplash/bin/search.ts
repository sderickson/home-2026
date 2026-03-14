import { search } from "../calls/search.ts";

// Same as ping: minimal query, one result (ping uses search() with these args)
const result = await search({ query: "nature", per_page: 1 });
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
console.log(JSON.stringify(result.result, null, 2));
