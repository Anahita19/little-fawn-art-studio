# Little Fawn Art Studio — ToDo

## Bilingual shell with Persian RTL
- [ ] Every screen available in English and Persian (فارسی), switchable at any time, with the choice remembered across visits.
- [ ] In Persian mode the whole layout mirrors to right-to-left: sidebar, timeline, timetable axis, tables, progress bars and artwork ordering.
- [ ] Persian typography uses a proper Persian typeface with correct line height; Persian digits are used for counts, prices, times and dates where the locale expects them.
- [ ] All seeded people, classes, rooms and artwork titles exist in both languages and swap with the language toggle.
- [ ] Language toggle is visible on desktop and mobile.

## Picture-book visual system
- [ ] Crayon-textured illustration treatment, bright macaron palette and rounded cards across the whole product.
- [ ] Hand-cut card shapes, paper grain, taped corners, crayon underlines and a fawn brand mark form a consistent visual language.
- [ ] Responsive from 375 px phone to wide desktop, with no clipped text in either direction.

## Today timeline (home page)
- [ ] Home page is a chronological timeline of today's classes.
- [ ] Each timeline entry shows class name, teacher, classroom, start/end time, enrolled count and roll-call status.
- [ ] Past / in-progress / upcoming states are derived from the current time; the next class is highlighted.
- [ ] When the studio is closed today (Friday), the page explains the closure and previews the next open day instead of showing an empty page.
- [ ] Summary figures and a "packages running low" nudge list sit alongside the timeline.

## Weekly timetable
- [ ] Weekly timetable is the core screen: all classes across the 5 teachers and 3 classrooms, laid out on a time grid.
- [ ] Each class is a different colour block; colour is stable per class and legible in both languages.
- [ ] Filters for teacher and classroom, plus a day-by-day readable fallback on small screens.
- [ ] Automatic conflict detection for room double-booking and teacher double-booking.
- [ ] Every clashing class card shakes visibly as a warning and carries a clash badge explaining what overlaps.
- [ ] Conflict summary lists the clashing pairs and links to the affected cards.

## Roll call
- [ ] Roll call opens for a specific class and date and lists that class's enrolled students.
- [ ] Each student can be marked present, late or absent, and the choice can be changed.
- [ ] A completion state shows how many of the roster have been marked; "mark all present" and "finish" actions work.
- [ ] Attendance is saved and reflected on the home timeline and the student profile.

## Lesson packages
- [ ] Package model is 20 lessons for $400; remaining lessons are shown per student.
- [ ] After roll call marks a student present or late, that student's remaining lessons go down automatically (exactly once per lesson, reversible if the mark is changed).
- [ ] The lesson progress bar animates downward on change.
- [ ] The bar turns orange when the package is almost used up, with a renewal reminder.
- [ ] A student with zero remaining lessons is shown as needing renewal and cannot go below zero.
- [ ] Renewal action adds a fresh 20-lesson package and records the renewal.

## Student profiles and artwork
- [ ] About 120 sample students are preloaded, each with an avatar, age, guardian, phone and class enrolments.
- [ ] Student card shows avatar, name, class chips, package progress and thumbnails of the latest artwork.
- [ ] Student profile shows full package status, attendance history and an artwork gallery with titles and dates.
- [ ] Roster supports search in both languages plus filters by class, teacher and package state.

## Preloaded studio data
- [ ] 5 teachers, 3 classrooms, ~120 students, lesson packages, artwork and a full weekly timetable are preloaded and browsable.
- [ ] At least two genuine clashes exist in the seeded timetable so the shake warning is demonstrable.
- [ ] Studio page summarises teachers, classrooms and the 20-lesson/$400 package.
- [ ] Demo data can be reset to its original state.

## Delivery
- [ ] Route manifest served at /manus-routes.json and kept in sync with the router.
- [ ] Production static build succeeds; checkpoint pushed to origin/main.
