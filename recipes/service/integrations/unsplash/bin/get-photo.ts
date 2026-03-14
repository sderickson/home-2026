import { getPhoto } from "../calls/get-photo.ts";

const photoId = process.argv[2] ?? "mock-photo-id";
const result = await getPhoto(photoId);
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
console.log(JSON.stringify(result.result, null, 2));
