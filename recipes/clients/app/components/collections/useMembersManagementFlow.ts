import type { ComputedRef } from "vue";
import { computed, ref, watch } from "vue";
import {
  membersListCollectionsQuery,
  useMembersAddCollectionsMutation,
  useMembersRemoveCollectionsMutation,
  useMembersUpdateCollectionsMutation,
} from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";
import { kratosIdentityEmail, useKratosSession } from "@saflib/ory-kratos-sdk";

/**
 * Stateful flow for the members management dialog: list members, add/change/remove
 * with mutations. The component binds to the returned refs and calls the handlers.
 */
export function useMembersManagementFlow(
  collectionId: ComputedRef<string>,
  isOpen: ComputedRef<boolean>,
) {
  const newMemberEmail = ref("");
  const newMemberRole = ref<"owner" | "editor" | "viewer">("editor");
  const addingMember = ref(false);

  const sessionQuery = useKratosSession();
  const membersQuery = useQuery(
    computed(() => ({
      ...membersListCollectionsQuery(collectionId.value),
      enabled: !!collectionId.value && isOpen.value,
    })),
  );

  const members = computed(() => membersQuery.data.value?.members ?? []);
  const profile = computed(() => sessionQuery.data.value);
  const isOwner = computed(() => {
    const email = kratosIdentityEmail(profile.value);
    if (!email) return false;
    return members.value.some((m) => m.email === email && m.role === "owner");
  });

  const addMutation = useMembersAddCollectionsMutation();
  const updateMutation = useMembersUpdateCollectionsMutation();
  const removeMutation = useMembersRemoveCollectionsMutation();

  watch(isOpen, (open) => {
    if (!open) newMemberEmail.value = "";
  });

  function resetForm() {
    newMemberEmail.value = "";
  }

  async function handleAddMember() {
    const id = collectionId.value;
    const email = newMemberEmail.value.trim();
    if (!id || !email || addingMember.value) return;
    addingMember.value = true;
    try {
      await addMutation.mutateAsync({
        id,
        email,
        role: newMemberRole.value,
      });
      newMemberEmail.value = "";
    } finally {
      addingMember.value = false;
    }
  }

  function handleChangeRole(memberId: string, role: string) {
    updateMutation.mutate({
      id: collectionId.value,
      memberId,
      role: role as "owner" | "editor" | "viewer",
    });
  }

  function handleRemoveMember(memberId: string) {
    removeMutation.mutate({ id: collectionId.value, memberId });
  }

  return {
    members,
    isOwner,
    newMemberEmail,
    newMemberRole,
    addingMember,
    handleAddMember,
    handleChangeRole,
    handleRemoveMember,
    resetForm,
  };
}
