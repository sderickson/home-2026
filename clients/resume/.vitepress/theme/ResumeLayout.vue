<template>
  <div class="resume-shell">
    <Content />
  </div>
</template>

<script setup lang="ts">
import { Content } from "vitepress";
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background: #e8eaed;
}

.resume-shell {
  min-height: 100vh;
  padding: 1.25rem 0.75rem 2rem;
}

@media print {
  html,
  body {
    background: #fff;
  }

  .resume-shell {
    padding: 0;
    min-height: 0;
  }
}
</style>
