# Little Fawn Art Studio

Little Fawn is a picture-book-style studio management system for a children's art studio. It manages 5 teachers, 3 classrooms, 23 weekly classes and approximately 120 young artists. The interface is bilingual English/Persian with full RTL support.

- **Live demo:** https://littlefawn-9pjuxixh.manus.space
- **GitHub:** https://github.com/Anahita19/little-fawn-art-studio

## Product tour

| Screen | Route | Purpose |
| --- | --- | --- |
| Today | `/` | Chronological timeline of today's classes, live/upcoming/completed states, roll-call progress, clashes and renewal nudges. Fridays show the next open day. |
| Timetable | `/timetable` | Weekly Saturday–Thursday schedule with colour-coded classes, teacher/classroom filters, responsive agenda mode and animated conflict warnings. |
| Students | `/students` | Searchable roster with class, teacher and package filters; sorting by name, age or remaining lessons; UTF-8 CSV export. |
| Student profile | `/students/:id` | Avatar, guardian details, phone, package balance, class enrolments, attendance history and artwork gallery with lightbox. |
| Roll call | `/roll-call/:classId` | Mark students present, late or absent; mark all; finish a class; package lessons are deducted exactly once for present/late. |
| Reports | `/reports` | Live studio pulse: package value, renewals, attendance rhythm, package health, teacher workload, room usage and latest attendance activity. |
| Guide | `/guide` | A bilingual feature tour and handbook covering the new reports, roles, package rules, attendance workflow and storybook motion. |
| Studio | `/studio` | Teachers, rooms, weekly rhythm and the 20-lesson package definition. Demo reset is admin-only. |
| User access | `/users` | Admin-only account management for Read only, Teacher and Administrator roles, with teacher-profile linking. |

## Business rules

- A package contains **20 lessons for $400** ($20 per lesson).
- Present and late attendance each deduct one lesson; absent attendance does not.
- Changing a mark is reversible and never double-deducts a lesson.
- A progress bar is healthy above 4 lessons, orange at 4 or fewer, and coral when empty.
- Students never go below zero lessons.
- Renewing adds a fresh 20-lesson package and records the renewal date, lesson count and price.
- Timetable clashes are detected when the same teacher or classroom is booked twice at overlapping times.

## Roles and permissions

Authentication uses Manus OAuth and the `webdev_app_session` cookie. The first owner account is an administrator. New signed-in accounts appear in the User access panel once they have entered the studio.

| Role | Can view | Can change |
| --- | --- | --- |
| Read only | All studio screens and reports | Nothing |
| Teacher | All studio screens and reports | Attendance for classes linked to their teacher profile |
| Administrator | All screens, reports and User access | Attendance, package renewals, demo reset, user roles and teacher assignments |

The server enforces these permissions in tRPC procedures; hiding a menu item is not the security boundary. The system prevents removing the last administrator and prevents an administrator from removing their own administrator access.

## Reports dashboard

Reports are calculated from the persisted studio snapshot rather than a second analytics dataset. It includes:

- Total value of purchased lesson inventory and recorded renewal revenue.
- Remaining lessons across all students.
- Present, late and absent attendance marks plus the show-up rate.
- Healthy, low and empty package counts with renewal pipeline callout.
- Per-teacher weekly class count, unique student count and seat usage.
- Per-room weekly class count, enrolled seats and capacity usage.
- The latest seven attendance records with student, class, date and mark status.

## Language and accessibility

The language toggle switches every label, seeded name, date and number between English and Persian. Persian mode mirrors the layout to RTL, including navigation, timetable axes, timelines, progress bars and artwork ordering. The selected language is stored in `localStorage`; `?lang=fa` and `?lang=en` can force a language on any route.

The design uses self-hosted Baloo 2, Nunito, Vazirmatn and Lalezar fonts. It includes crayon textures, macaron colours, hand-cut card shapes, paper grain, taped corners, animated doodles and reduced-motion support through `prefers-reduced-motion`.

## Data and persistence

The managed MySQL-compatible database stores a single durable `studio_state` snapshot containing:

- Students, packages, renewals and artwork metadata.
- Teachers and classrooms.
- Weekly classes and timetable assignments.
- Attendance records.
- Authenticated users, roles and teacher-profile assignments.

The first bootstrap seeds the studio only when no snapshot exists. Later edits are not overwritten. Attendance and renewals are server-side mutations exposed through protected tRPC routes.

Relevant database files:

- `drizzle/schema.ts` — users and studio-state schema.
- `drizzle/*.sql` — migrations.
- `server/db.ts` — database reads, writes and initialization.
- `server/routers.ts` — authentication, role checks and studio mutations.
- `server/studio.ts` — server-side studio action reducer.

## Local development

Requirements: Node.js, pnpm 10 and access to the project's managed database/auth environment.

```bash
pnpm install
pnpm dev                 # database-backed server on PORT or 3000
pnpm check               # TypeScript diagnostics
pnpm test                # Vitest suite
pnpm build               # Vite client + production server bundle
pnpm db:push             # Generate and apply Drizzle migrations
```

The server exposes `/api/health` for deployment health checks. The static route manifest is served at `/manus-routes.json` and lists all page routes for the platform.

## Project structure

```text
client/src/
  components/            cards, avatars, artwork, package bar, shell and brand
  data/                  seed data and database-backed studio provider
  i18n/                  English/Persian dictionary and RTL provider
  lib/                   types, palette, time helpers and selectors
  pages/                 Today, Timetable, Students, Profile, RollCall,
                         Reports, Guide, Studio, Users and NotFound
server/
  _core/                 server entry, OAuth/session SDK and tRPC context
  db.ts                  managed database helper
  routers.ts             protected API procedures and role checks
  studio.ts              server-side mutation reducer
drizzle/
  schema.ts              database schema
  *.sql                  migration history
```

Artwork and brand illustrations use durable platform `/manus-storage/` paths. If an image cannot load, the UI displays a crayon fallback instead of a broken image. `app.config.ts` contains the platform logo metadata.

## Verification history

The delivered application has been typechecked, production-built and tested with the existing Vitest suite. The current release includes the reports workspace and is intended to be published from the canonical `main` checkpoint.
