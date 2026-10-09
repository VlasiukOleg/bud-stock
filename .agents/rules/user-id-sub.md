# User ID is in `sub`

When accessing the current user's ID from `useSupabaseUser()`, ALWAYS use `user.value?.sub` instead of `user.value?.id`.

The ID in this project's user schema is stored under the `sub` property, not `id`. 
Attempting to read `user.value?.id` will result in `undefined` and cause components to hang or fail silently.

**Correct:**
```typescript
const user = useSupabaseUser();
const userId = user.value?.sub; // ALWAYS USE THIS
```

**Incorrect:**
```typescript
const user = useSupabaseUser();
const userId = user.value?.id; // NEVER USE THIS
```
