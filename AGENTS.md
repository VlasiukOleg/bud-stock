# BudStock Project Guidelines & Agent Rules

## 1. Supabase User ID (CRITICAL / STRICT)
* When accessing the current user's ID from `useSupabaseUser()`, **ALWAYS** use `(user.value as any)?.sub` or `user.value?.sub`.
* **NEVER USE `user.value?.id`**. In this project's user schema, the ID is stored under `.sub`. Reading `.id` returns `undefined` and causes components to silently fail or hang.
  ```typescript
  // CORRECT
  const user = useSupabaseUser();
  const userId = (user.value as any)?.sub;

  // INCORRECT - NEVER DO THIS
  const userId = user.value?.id;
  ```

---

## 2. Admin Permissions & Security
* Admin access is strictly limited to: `ikslprint@gmail.com` (defined in `app/composables/useAdmin.ts`).
* The admin panel `/admin/moderation` is protected with inline Nuxt route middleware (`definePageMeta`) that immediately bounces non-admins to `/` with zero UI flash.

---

## 3. Listing Lifecycle & Expiration Rules
* **Active Duration**: 25 days (`LISTING_DURATION_DAYS = 25` in `app/constants/listing.ts`).
* **Retention Period**: 45 days (`LISTING_RETENTION_DAYS = 45` in `app/constants/listing.ts`) for inactive states (`sold`, `deactivated`, `expired`, `rejected`, `deleted`).
* **Automatic Deletion**: Handled exclusively on the Supabase server via `pg_cron` running nightly at 03:00 (`SELECT cleanup_expired_listings()`). Do NOT perform client-side batch delete queries.
* **Client-side Filtering**: `profile/listings.vue` filters out any listings older than 45 days immediately so users never see expired items even before the nightly cron runs.
* **Reactivating Listings**: When reactivating an inactive listing, if `expires_at > now()`, preserve the remaining active days instead of resetting to +25 days (prevents infinite renewal exploit).
* **Manual Deletion by User**: Users can delete inactive listings (`sold`, `deactivated`, `expired`, `rejected`) via the 3-dots menu with a confirmation modal. This sets `listing_state = 'deleted'`, immediately hiding it from the author's cabinet and switching related chats to read-only mode ("Чат заблоковано, оскільки оголошення видалено автором"). Physical removal from DB, Storage, and chats happens automatically after the 45-day retention period.
* **Early Renewal Before Expiry (Implemented)**:
  * When an active listing has `<= 5 days` remaining before expiration (`daysRemaining <= 5`), the badge highlights with an amber warning icon and text: `"Термін спливає через X дн."` (or `"Термін спливає сьогодні!"`).
  * Directly displays the prominent button `[ 🔄 Продовжити на 25 днів ]` alongside a compact edit button `[ ✏️ ]` on the active card in user profile (`ProfileListingCard.vue`).
  * Clicking it extends `expires_at` by +25 days from now (`renewListing`), keeping the product continuously active on the map without dropping into "Неактивні".

---

## 4. Product Details Page Access (`/catalog/[id]`)
* If a listing is inactive (`sold`, `deactivated`, `expired`, `moderation`, `rejected`):
  * **The author and admins** (`isUserOwnerProduct || isAdmin`) can view full product details and management status banners (allowing admins to review listings from the `/admin/moderation` queue via "Повний перегляд").
  * **All other visitors** (guests and other regular users) see a clean stub ("Оголошення більше не актуальне" or "Товар уже продано") with zero pictures, description, phone numbers, or map.
* **Views Count**: Never increment views (`incrementViews`) for inactive listings or admin reviews.

---

## 5. Technology Stack & Coding Standards
* **Framework**: **Nuxt 4** (`"nuxt": "^4.2.2"`, Vue 3.5+, script setup, TypeScript, modern `app/` directory structure).
* **UI Components**: **Nuxt UI** (`@nuxt/ui ^4.5.1`).
  * **Build with Nuxt UI to the maximum**: Always prioritize native Nuxt UI components (`UButton`, `UCard`, `UIcon`, `UBadge`, `UModal`, `USlideover`, `UInput`, `USelect`, `UTextarea`, `UTabs`, `UDropdownMenu`, etc.) instead of writing custom raw HTML or reinventing wheels.
* **Styling**: Tailwind CSS v4 (`tailwindcss ^4.2.1`).
* **Backend**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, pg_cron).
* **Code Style**: Keep code concise, clean, and preserve existing comments.

---

## 6. MCP Servers Integration
* The workspace is equipped with **MCP servers** for **`nuxt`** and **`nuxt-ui`**.
* Always use these MCP tools (`search-components`, `get-component`, `get-documentation-page`, `search-icons`, `get-migration-guide`, etc.) to consult official, up-to-date documentation and component APIs when building or updating UI features.

---

## 7. Git Commits Policy (STRICT)
* **NEVER run `git commit` automatically**.
* The user always reviews changes first and commits manually.
* The agent only proposes a clear, formatted commit message for the user.

---

## 8. Application Routes & Navigation (STRICT)
* **Always use `APP_ROUTES` constants** (defined in `app/utils/routes.ts`) for internal paths, links, and redirects instead of raw hardcoded string literals (e.g. use `APP_ROUTES.AUTH.LOGIN`, `APP_ROUTES.AUTH.CONFIRM`, `APP_ROUTES.CATALOG`, `APP_ROUTES.HOME` instead of `'/login'`, `'/confirm'`, `'/catalog'`, `'/'`).
* **Auth & Temporary Redirects**: Always use `{ replace: true }` when redirecting from temporary auth handler/callback pages (such as `confirm.vue` or auto-redirects in `login.vue`) to avoid polluting the browser history and creating infinite bounce loops when users click the "Back" button.
* **Back Button Navigation**: In detail pages (e.g. `catalog/[id].vue`, `user/[id].vue`), the "Back" action must check `window.history.state?.back` (safeguarded with `import.meta.client`). If the previous page was an auth route (`APP_ROUTES.AUTH.LOGIN`, `APP_ROUTES.AUTH.CONFIRM`) or if no history exists (direct entry or external OAuth redirect), safely fall back to `APP_ROUTES.CATALOG`.

