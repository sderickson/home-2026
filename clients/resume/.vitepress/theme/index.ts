import type { Theme } from "vitepress";
import ResumeLayout from "./ResumeLayout.vue";
import ResumePage from "./components/ResumePage.vue";
import "./style.css";

export default {
  Layout: ResumeLayout,
  enhanceApp({ app }) {
    app.component("ResumePage", ResumePage);
  },
} as Theme;
