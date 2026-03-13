<template>
  <v-table>
    <thead>
      <tr>
        <th>{{ t(strings.name_column) }}</th>
        <th>{{ t(strings.role_column) }}</th>
        <th>{{ t(strings.members_column) }}</th>
        <th class="text-right">{{ t(strings.actions_column) }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="collection in collections" :key="collection.id">
        <td>{{ collection.name }}</td>
        <td>{{ roleLabel(collection.id) }}</td>
        <td>
          <span class="text-medium-emphasis text-caption">
            {{ memberCountLabel(collection.id) }}
          </span>
        </td>
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
            v-if="isOwner(collection.id)"
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

const props = defineProps<{
  collections: Array<{ id: string; name: string }>;
  members: Array<{
    id: string;
    collectionId: string;
    email: string;
    role: string;
    isCreator: boolean;
    createdAt: string;
  }>;
  userEmail: string;
}>();

defineEmits<{
  "manage-members": [collection: { id: string; name: string }];
}>();

const { t } = useReverseT();

function membersForCollection(collectionId: string) {
  return props.members.filter((m) => m.collectionId === collectionId);
}

function callerMember(collectionId: string) {
  return membersForCollection(collectionId).find(
    (m) => m.email === props.userEmail,
  );
}

function roleLabel(collectionId: string): string {
  const member = callerMember(collectionId);
  return member?.role ?? "—";
}

function memberCountLabel(collectionId: string): string {
  const count = membersForCollection(collectionId).length;
  const key = count === 1 ? strings.member_count : strings.member_count_plural;
  return `${count} ${t(key)}`;
}

function isOwner(collectionId: string): boolean {
  return callerMember(collectionId)?.role === "owner";
}
</script>
