<script setup lang="ts">
import { linkToHrefWithHost } from "@saflib/links";
import { useResolvedHref } from "@saflib/vue/useResolvedHref";
import { appLinks, authLinks } from "@sderickson/recipes-links";

const inlineDemoHref = useResolvedHref(appLinks.home);
const inlineRegisterHref = useResolvedHref(() =>
  linkToHrefWithHost(authLinks.register, {
    params: { redirect: linkToHrefWithHost(appLinks.home) },
  }),
);
</script>

<div class="root-home">

# Scott's Recipe List

A place to organize, iterate on, and share recipes.

Built to suit the way I organize and iterate on my recipes. It's available for
friends and family by invite. If you're not signed in, you can try the demo or
browse the source.

## What it is

Access is invite-only for friends and family. Others can
<a :href="inlineDemoHref" class="text-primary">try the demo</a>
or
<a :href="inlineRegisterHref" class="text-primary">sign up</a>
or
<a href="https://github.com/sderickson/home-2026/tree/main/recipes" target="_blank" rel="noopener noreferrer" class="text-primary">
view source on GitHub
</a>

## Features

- **Ingredients & instructions**
  Structured ingredient lists and markdown recipe instructions.
- **Version history**
  See how a recipe evolved over time. Every edit is kept so you can compare or revert.
- **Recipe notes**
  Add notes to a recipe - what you'd do differently, substitutions that worked - so you can look back next time.
- **Images**
  Upload your own photos, or drop in Unsplash images as quick filler until you take your own.
- **Menus**
  Group recipes into menus to decide what to cook or what to shop for.
- **Sharing**
  Share recipes and collections with friends and family - view-only or with edit access.

## Try it

<RootHomeTryActions />

</div>
