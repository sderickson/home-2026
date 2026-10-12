import { h } from "vue";
import type { IconProps, IconSet, VuetifyOptions } from "vuetify";
import { aliases, mdi as mdiSvg } from "vuetify/iconsets/mdi-svg";
import { mdiIconPaths } from "./assets/mdi-icons.ts";

/** Resolve `mdi-*` class names to SVG paths; pass through paths / other values. */
function resolveMdiIcon(icon: IconProps["icon"]): IconProps["icon"] {
  if (typeof icon !== "string") {
    return icon;
  }
  if (Object.hasOwn(mdiIconPaths, icon)) {
    return mdiIconPaths[icon]!;
  }
  if (icon.startsWith("mdi-") && import.meta.env.DEV) {
    console.warn(
      `[vuetify] Unknown MDI icon "${icon}" — add it to recipes/clients/common/assets/mdi-icons.ts`,
    );
  }
  return icon;
}

/**
 * SVG MDI set that still accepts template strings like `icon="mdi-plus"`
 * (webfont class names) by looking them up in {@link mdiIconPaths}.
 */
const mdi: IconSet = {
  component: (props) =>
    h(mdiSvg.component, {
      ...props,
      icon: resolveMdiIcon(props.icon),
    }),
};

/**
 * "Recipe Box" palette: index-card white on a kraft-paper background.
 * Custom colors become `--v-theme-<name>` CSS variables (`r,g,b`) and
 * `text-<name>` / `bg-<name>` classes. All text pairs meet WCAG AA (4.5:1);
 * recheck contrast if you change one.
 */
const recipesLightTheme = {
  dark: false,
  colors: {
    background: "#E8E3D9",
    surface: "#FFFEFA",
    "on-background": "#22252A",
    "on-surface": "#22252A",
    primary: "#2C4A75",
    secondary: "#1C3356",
    error: "#B4432E",
    outline: "#C9C1B1",
    /** Menu divider tabs, search field on white. */
    "surface-tab": "#F4EFE4",
    "on-surface-tab": "#22252A",
    /** Selected toggle, hover. */
    "primary-tint": "#E3EAF4",
    /** Subtitles, notes. */
    "ink-2": "#4A4E56",
    /** Breadcrumbs, counts, meta text. */
    muted: "#5C6068",
    /** App bar bottom border. */
    "outline-soft": "#D6CFC1",
    /** The index card's red header line. */
    "card-red-line": "#E2A293",
    /** Vertical line between ingredients and method. */
    "card-red-line-soft": "#EBC5BB",
    /** Ruled lines on cards. */
    "card-rule": "#D3DEEC",
    /** DEMO badge background. */
    demo: "#C2513B",
  },
  variables: {
    /** Body text is full ink (contrast is checked against the solid colors). */
    "high-emphasis-opacity": 1,
  },
} as const;

export const vuetifyConfig: VuetifyOptions = {
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VAppBar: {
      flat: true,
      color: "surface",
      height: 64,
    },
    VBtn: {
      rounded: "sm",
      variant: "flat",
    },
    VBtnToggle: {
      rounded: "sm",
    },
    VCard: {
      rounded: "xs",
      flat: true,
    },
    VChip: {
      rounded: "sm",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      bgColor: "surface",
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: recipesLightTheme,
    },
  },
};
