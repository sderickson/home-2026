# Addendum: Return members alongside collections in GET /collections

## Problem

GET /collections returns `{ collections: Collection[] }` but has no membership info. The frontend Collections page wants to show the user's role per collection and member count, but currently displays a placeholder. The DB query already inner-joins `collection_member` to filter by the caller's email, so the data is nearby.

## Approach

Return **two separate arrays**: `{ collections: Collection[], members: CollectionMember[] }`. The `members` array contains all members for all returned collections (not just the caller's). Collection objects stay pure — no auth/role fields. The frontend joins client-side by `collectionId` to derive the caller's role, member counts, etc.

## Changes

### 1. DB: add a query to fetch all members for a set of collection IDs

**File:** `recipes/service/db/queries/collection-member/list-by-collection-ids.ts` (new)

Add a query that takes an array of collection IDs and returns all `CollectionMemberEntity` rows for those collections. This is the batch fetch — one query, no N+1.

### 2. OpenAPI spec: update list response to include members

**File:** `recipes/service/spec/routes/collections/list.yaml`

Change the 200 response schema from:

```yaml
properties:
  collections:
    type: array
    items:
      $ref: "../../schemas/collection.yaml"
```

to:

```yaml
properties:
  collections:
    type: array
    items:
      $ref: "../../schemas/collection.yaml"
  members:
    type: array
    items:
      $ref: "../../schemas/collection-member.yaml"
    description: "All members for all returned collections."
required:
  - collections
  - members
```

### 3. HTTP handler: fetch members and include in response

**File:** `recipes/service/http/routes/collections/list.ts`

After fetching the filtered collection list, extract the collection IDs and call the new `list-by-collection-ids` query. Return both arrays.

**File:** `recipes/service/http/routes/collections/_helpers.ts`

Update `collectionsListResultToListCollectionsResponse` to accept both collections and members, mapping each with their existing helpers (`collectionToApiCollection`, `collectionMemberToApiCollectionMember`).

### 4. SDK: no manual change expected

After the spec regenerates, the list query's response type picks up `members` automatically.

### 5. Frontend: display actual role and member count

**File:** `recipes/clients/app/pages/collections/list/CollectionsTable.vue`

- Accept `members` as a prop (or compute from the loader data).
- For each collection, filter `members` by `collectionId` to find the caller's row (match on the current user's email) and display `role`.
- Optionally show a member count badge per collection.
- Use the caller's role to conditionally show/hide the "Manage Members" button (owner only).

**File:** `recipes/clients/app/pages/collections/list/CollectionsTable.strings.ts`

Remove the `role_placeholder` string.
