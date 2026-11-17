# Little Fawn Art Studio — ToDo

> Status: complete — all items verified with typecheck, static build and headless browser checks.

## Post-delivery improvements
- [x] Filter the student roster by teacher.
- [x] Export the current filtered roster as a UTF-8 BOM CSV for Excel and Persian text.


## Bilingual shell with Persian RTL
- [x] Every screen available in English and Persian (فارسی), switchable at any time, with the choice remembered across visits.
- [x] In Persian mode the whole layout mirrors to right-to-left: sidebar, timeline, timetable axis, tables, progress bars and artwork ordering.
- [x] Persian typography uses a proper Persian typeface with correct line height; Persian digits are used for counts, prices, times and dates where the locale expects them.
- [x] All seeded people, classes, rooms and artwork titles exist in both languages and swap with the language toggle.
- [x] Language toggle is visible on desktop and mobile.

## Picture-book visual system
- [x] Crayon-textured illustration treatment, bright macaron palette and rounded cards across the whole product.
- [x] Hand-cut card shapes, paper grain, taped corners, crayon underlines and a fawn brand mark form a consistent visual language.
- [x] Responsive from 375 px phone to wide desktop, with no clipped text in either direction.

## Today timeline (home page)
- [x] Home page is a chronological timeline of today's classes.
- [x] Each timeline entry shows class name, teacher, classroom, start/end time, enrolled count and roll-call status.
- [x] Past / in-progress / upcoming states are derived from the current time; the next class is highlighted.
- [x] When the studio is closed today (Friday), the page explains the closure and previews the next open day instead of showing an empty page.
- [x] Summary figures and a "packages running low" nudge list sit alongside the timeline.

## Weekly timetable
- [x] Weekly timetable is the core screen: all classes across the 5 teachers and 3 classrooms, laid out on a time grid.
- [x] Each class is a different colour block; colour is stable per class and legible in both languages.
- [x] Filters for teacher and classroom, plus a day-by-day readable fallback on small screens.
- [x] Automatic conflict detection for room double-booking and teacher double-booking.
- [x] Every clashing class card shakes visibly as a warning and carries a clash badge explaining what overlaps.
- [x] Conflict summary lists the clashing pairs and links to the affected cards.

## Roll call
- [x] Roll call opens for a specific class and date and lists that class's enrolled students.
- [x] Each student can be marked present, late or absent, and the choice can be changed.
- [x] A completion state shows how many of the roster have been marked; "mark all present" and "finish" actions work.
- [x] Attendance is saved and reflected on the home timeline and the student profile.

## Lesson packages
- [x] Package model is 20 lessons for $400; remaining lessons are shown per student.
- [x] After roll call marks a student present or late, that student's remaining lessons go down automatically (exactly once per lesson, reversible if the mark is changed).
- [x] The lesson progress bar animates downward on change.
- [x] The bar turns orange when the package is almost used up, with a renewal reminder.
- [x] A student with zero remaining lessons is shown as needing renewal and cannot go below zero.
- [x] Renewal action adds a fresh 20-lesson package and records the renewal.

## Student profiles and artwork
- [x] About 120 sample students are preloaded, each with an avatar, age, guardian, phone and class enrolments.
- [x] Student card shows avatar, name, class chips, package progress and thumbnails of the latest artwork.
- [x] Student profile shows full package status, attendance history and an artwork gallery with titles and dates.
- [x] Roster supports search in both languages plus filters by class, teacher and package state.

## Preloaded studio data
- [x] 5 teachers, 3 classrooms, ~120 students, lesson packages, artwork and a full weekly timetable are preloaded and browsable.
- [x] At least two genuine clashes exist in the seeded timetable so the shake warning is demonstrable.
- [x] Studio page summarises teachers, classrooms and the 20-lesson/$400 package.
- [x] Demo data can be reset to its original state.

## Delivery
- [x] Route manifest served at /manus-routes.json and kept in sync with the router.
- [x] Production static build succeeds; checkpoint pushed to origin/main.
