# Build notes

## Generated assets (served from platform storage)

Artwork pool (10 images), used by `client/src/data/seed.ts`:

| # | Subject | URL |
| --- | --- | --- |
| 1 | Rainbow house | /manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-1.webp |
| 2 | Orange cat | /manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-2.webp |
| 3 | Rocket + moon | /manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-3.webp |
| 4 | Blue fish | /manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-4.webp |
| 5 | Sunflower + child | /manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-5.webp |
| 6 | Green dinosaur | /manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-1.webp |
| 7 | Butterfly | /manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-2.webp |
| 8 | Sailboat | /manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-3.webp |
| 9 | Three children | /manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-4.webp |
| 10 | Night camp | /manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-5.webp |

Brand illustrations:

- Fawn painting at an easel: `/manus-storage/async-images/yTmHw9m4gVn9bNoxXQNRRz/image-1.webp` (sidebar card)
- Studio supplies shelf: `/manus-storage/async-images/yTmHw9m4gVn9bNoxXQNRRz/image-2.webp` (closed-day card, studio page)

These paths resolve through the platform preview/published gateway. A direct read on the dev
port (127.0.0.1:3000) does not serve `/manus-storage/`, so headless checks against that origin
show the fallback art instead — that is expected.

## App facts

- Static build (`pnpm build:static` → `dist/public`), no server or database.
- State: `client/src/data/studio.tsx`, persisted in `localStorage` under `littlefawn:studio:v1`.
- Language: `client/src/i18n/LanguageProvider.tsx`, persisted under `littlefawn:lang`; `?lang=en|fa` overrides.
- Seed data: 5 teachers, 3 classrooms, 23 weekly classes, 120 students, 3 timetable clashes.
- Package: 20 lessons / $400; low threshold is 4 remaining; bar turns orange at ≤4, coral at 0.
- Timetable grid shows Saturday–Thursday; Friday is marked closed.
- Dev server: `PORT=3000 pnpm dev:static` (service job).