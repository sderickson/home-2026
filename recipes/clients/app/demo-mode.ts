export const DEMO_MODE_KEY = "recipes-demo-mode";

export function isDemoMode(): boolean {
  return (
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem(DEMO_MODE_KEY) === "1"
  );
}

export function setDemoMode(on: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  if (on) {
    sessionStorage.setItem(DEMO_MODE_KEY, "1");
  } else {
    sessionStorage.removeItem(DEMO_MODE_KEY);
  }
}
