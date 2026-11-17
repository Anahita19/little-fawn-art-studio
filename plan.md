# Little Fawn Art Studio — Database and Login Plan

## Goal
Move the studio manager from browser-only localStorage to a persistent managed MySQL database and protect the application with the starter's Manus OAuth login/session flow.

## Implementation decisions

- Use the existing Manus OAuth implementation and the reserved `webdev_app_session` cookie. Do not create a separate password store or simulated development login.
- Keep the existing `users` table as the application account registry. Authenticated users can access the studio; the first owner account is promoted to admin by the starter's existing `MANUS_OWNER_OPEN_ID` rule.
- Add a managed `studio_state` table with one singleton row containing the serializable `StudioData` payload as MySQL JSON. This keeps the current client domain model stable while making attendance, renewals and seeded data durable across browsers and devices.
- Expose the state through protected tRPC procedures. Mutations load the latest persisted state, apply the same reducer rules used today, and write the result back server-side.
- Replace the StudioProvider's localStorage source with the authenticated API query and server mutations. Keep an in-memory optimistic view only while a mutation is pending; do not write studio records back to localStorage.
- Add a bilingual login gate and signed-in user menu to the picture-book shell. Logged-out users see the existing Manus OAuth start-login action; authenticated users see their name, email, role and sign-out action.
- Run the checked-in Drizzle migration against the managed database, seed the singleton row on first protected read without overwriting later edits, and run the production server path rather than the static-only dev path.

## Project structure

- `drizzle/schema.ts`: users plus the singleton `studio_state` table.
- `server/db.ts`: state read/insert/update helpers and existing user helpers.
- `server/routers.ts`: protected auth and studio bootstrap/mutation procedures.
- `client/src/lib/trpc.ts` and `client/src/main.tsx`: QueryClient and tRPC providers.
- `client/src/data/studio.tsx`: API-backed studio context and mutation bridge.
- `client/src/components/layout/AppShell.tsx`: authenticated shell, user account controls and bilingual login gate.
- `client/src/i18n/dictionary.ts`: login/account/loading/error copy in English and Persian.

## Safety and compatibility

- Preserve the existing seeded data and all current class, student, artwork, package and attendance behavior.
- Do not expose `DATABASE_URL`, OAuth credentials or session signing material to the browser.
- Keep the preview-compatible cookie attributes (`SameSite=None; Secure`) already supplied by the auth helper.
- If the database is unavailable, show a clear retry state rather than silently falling back to localStorage.
