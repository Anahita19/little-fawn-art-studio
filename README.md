# Little Fawn Art Studio

A picture-book studio manager for a children's art studio: 5 teachers, 3 classrooms,
23 weekly classes and 120 young artists. Bilingual English / Persian with full RTL support.

## What is inside

| Page | Route | What it does |
| --- | --- | --- |
| Today | `/` | Timeline of today's classes with live status, roll-call progress, clash alert and a renewal nudge list. Falls back to the next open day when the studio is closed. |
| Timetable | `/timetable` | Weekly grid, Saturday–Thursday, one colour per class. Overlapping classes get a dashed warning border and a repeating shake. Filter by teacher or classroom. |
| Students | `/students` | 120 seeded students, searchable by name, guardian, phone or class; filter by package state, class or teacher; export the current filtered roster as a Persian-safe CSV. |
| Student profile | `/students/:id` | Avatar, guardian details, package meter, artwork gallery with lightbox, recent attendance, class list and a teacher's note. |
| Roll call | `/roll-call/:classId` | Present / late / absent stamps. Marking a child present deducts one lesson from their package immediately. |
| Studio | `/studio` | Teachers, classrooms, the 20-lesson package and demo reset. |

## Package rules

- A package is **20 lessons for $400** ($20 per lesson).
- Present or late deducts one lesson; absent never does.
- The progress bar is green above 4 lessons, **orange at 4 or fewer**, and coral when empty.
- Renewing adds another 20 lessons and keeps the remaining balance.

## Language

The toggle in the sidebar switches every string, name, date and number between English and
Persian, and flips the whole document to RTL. The choice is stored in `localStorage`; add
`?lang=fa` or `?lang=en` to any URL to force a language.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 with a custom crayon design system in `client/src/index.css`
- Wouter for routing, lucide-react for icons, sonner for toasts
- No backend: state lives in `localStorage` under `littlefawn:studio:v1`, seeded from
  `client/src/data/seed.ts`

## Commands

```bash
pnpm install
pnpm dev:static      # development server
pnpm check           # typecheck
pnpm build:static    # static build into dist/public
```

## Layout

```
client/src/
  components/        cards, avatars, package bar, artwork thumbnails, shell
  data/              seed data + persistent studio store
  i18n/              dictionary and language provider
  lib/               types, palette, time helpers, selectors
  pages/             Today, Timetable, Students, StudentProfile, RollCall, Studio
```

Artwork and brand illustrations are served from the platform's `/manus-storage/` paths, which
resolve in the preview and on the published site. If an image cannot load, a crayon fallback is
shown instead of a broken icon.

`app.config.ts` holds the studio logo used by the platform.
