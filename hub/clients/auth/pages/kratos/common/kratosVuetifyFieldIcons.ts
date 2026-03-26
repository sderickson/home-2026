/** Prepend icons for Kratos browser-flow fields — matches saflib identity auth (`LoginPage`, `RegisterPage`). */
export function kratosPrependInnerIconForFieldName(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n === "identifier" || n === "email" || n.includes("traits.email") || n.endsWith("[email]")) {
    return "mdi-email-outline";
  }
  if (n === "password" || n.includes("password")) {
    return "mdi-lock-outline";
  }
  return undefined;
}
