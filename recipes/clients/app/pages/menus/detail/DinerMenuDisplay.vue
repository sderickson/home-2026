<template>
  <div class="diner-menu" :class="{ 'diner-menu--narrow': !smAndUp }">
    <header class="diner-menu__head">
      <h1 class="diner-menu__title font-title">{{ menuTitle }}</h1>
      <p class="diner-menu__summary font-mono text-muted">
        {{
          t(strings.diner_summary, {
            sections: groupings.length,
            recipes: recipeCount,
          })
        }}
      </p>
    </header>

    <section
      v-for="(grouping, gIndex) in groupings"
      :key="gIndex"
      class="diner-menu__section"
    >
      <h2 class="diner-menu__section-title font-title">
        {{ grouping.name }}
        <span class="diner-menu__count font-mono text-muted">
          ({{ grouping.recipeIds.length }})
        </span>
      </h2>
      <ul class="diner-menu__cards">
        <li v-for="recipeId in grouping.recipeIds" :key="recipeId">
          <v-card
            :to="recipeLink(recipeId)"
            :ripple="false"
            class="diner-card paper"
            link
          >
            <v-img
              v-if="enrichmentByRecipeId.get(recipeId)?.firstImageUrl"
              :src="enrichmentByRecipeId.get(recipeId)!.firstImageUrl!"
              :alt="recipeById.get(recipeId)?.title ?? ''"
              cover
              class="diner-card__photo photo-print"
            />
            <span
              v-else
              class="diner-card__photo diner-card__photo--empty photo-print"
              aria-hidden="true"
            />
            <span class="diner-card__text">
              <span class="diner-card__title font-title">
                {{ recipeById.get(recipeId)?.title ?? recipeId }}
              </span>
              <span
                v-if="subtextByRecipeId.get(recipeId)"
                class="diner-card__sub text-ink-2"
              >
                {{ subtextByRecipeId.get(recipeId) }}
              </span>
            </span>
          </v-card>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { menu_groupings_display as strings } from "./MenuGroupingsDisplay.strings.ts";

const props = defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipeById: Map<string, { id: string; title: string; subtitle?: string }>;
  subtextByRecipeId: Map<string, string>;
  enrichmentByRecipeId: Map<
    string,
    {
      firstImageUrl: string | null;
      keyIngredients: {
        name: string;
        quantity: string;
        unit: string;
      }[];
    }
  >;
  menuTitle: string;
  recipeLink: (recipeId: string) => string;
}>();

const { t } = useReverseT();
const { smAndUp } = useDisplay();

const recipeCount = computed(() =>
  props.groupings.reduce((n, g) => n + g.recipeIds.length, 0),
);
</script>

<style scoped>
.diner-menu__title {
  margin: 0;
  font-weight: 600;
  font-size: 40px;
  line-height: 1.1;
}

.diner-menu__summary {
  margin: 4px 0 0;
  font-size: 13px;
}

.diner-menu__section {
  margin-top: 28px;
}

.diner-menu__section-title {
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid rgb(var(--v-theme-outline));
  font-weight: 600;
  font-size: 22px;
  line-height: 1.3;
}

.diner-menu__count {
  font-size: 14px;
  font-weight: 400;
}

.diner-menu__cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

/* White card with the index card's red line along the top. */
.diner-card {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 100%;
  min-height: 76px;
  padding: 8px 14px 8px 8px;
  border-top: 2px solid rgb(var(--v-theme-card-red-line));
  border-radius: 2px;
  color: rgb(var(--v-theme-on-surface));
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.diner-card:hover,
.diner-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: var(--paper-shadow-raised);
}

/* No grey hover/focus wash: the lift is the hover state. */
.diner-card :deep(.v-card__overlay) {
  display: none;
}

.diner-card__photo {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
}

.diner-card__photo--empty {
  background: rgb(var(--v-theme-surface-tab));
}

.diner-card__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.diner-card__title {
  font-weight: 600;
  font-size: 18px;
  line-height: 1.2;
}

.diner-card__sub {
  font-size: 13px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media print {
  .diner-card {
    break-inside: avoid;
    border: 1px solid rgb(var(--v-theme-outline-soft));
    border-top: 2px solid rgb(var(--v-theme-card-red-line));
  }

  .diner-menu__section-title {
    break-after: avoid;
  }
}

/* Phones: one card per row, a little larger. */
.diner-menu--narrow .diner-menu__title {
  font-size: 32px;
}

.diner-menu--narrow .diner-menu__section {
  margin-top: 22px;
}

.diner-menu--narrow .diner-menu__section-title {
  font-size: 20px;
}

.diner-menu--narrow .diner-menu__cards {
  grid-template-columns: 1fr;
  gap: 8px;
}

.diner-menu--narrow .diner-card__photo {
  flex-basis: 60px;
  width: 60px;
  height: 60px;
}
</style>
