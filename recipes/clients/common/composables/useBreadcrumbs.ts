import { onUnmounted, shallowRef, watchEffect } from "vue";

/** One step in the top bar's breadcrumb trail. Omit `to` for the current page. */
export interface Breadcrumb {
  title: string;
  to?: string;
}

const current = shallowRef<Breadcrumb[]>([]);
let owner: symbol | null = null;

/**
 * Sets the breadcrumbs shown in the layout's top bar for as long as the calling
 * page is mounted. The layout adds the root ("Recipes") crumb itself, so pass
 * only the crumbs after it. The getter is reactive.
 */
export function useBreadcrumbs(getCrumbs: () => Breadcrumb[]) {
  const id = Symbol("breadcrumbs");
  watchEffect(() => {
    owner = id;
    current.value = getCrumbs();
  });
  onUnmounted(() => {
    // The next page may already have set its own crumbs.
    if (owner === id) {
      owner = null;
      current.value = [];
    }
  });
}

/** Read side, for the layout. */
export function useCurrentBreadcrumbs() {
  return current;
}
