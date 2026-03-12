<template>
  <v-table>
    <thead>
      <tr>
        <th>{{ t(strings.name_column) }}</th>
        <th>{{ t(strings.role_column) }}</th>
        <th class="text-right">{{ t(strings.actions_column) }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="collection in collections" :key="collection.id">
        <td>{{ collection.name }}</td>
        <td>{{ t(strings.role_placeholder) }}</td>
        <td class="text-right">
          <v-btn
            variant="tonal"
            size="small"
            class="mr-1"
            :to="`/c/${collection.id}/recipes/list`"
          >
            {{ t(strings.open_recipes) }}
          </v-btn>
          <v-btn
            variant="outlined"
            size="small"
            @click="$emit('manage-members', collection)"
          >
            {{ t(strings.manage_members) }}
          </v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { collections_table as strings } from "./CollectionsTable.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

defineProps<{
  collections: Array<{ id: string; name: string }>;
}>();

defineEmits<{
  "manage-members": [collection: { id: string; name: string }];
}>();

const { t } = useReverseT();
</script>
