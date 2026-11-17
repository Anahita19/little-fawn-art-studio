import { CLASS_TINTS } from "@/lib/palette";
import { dateKey, daysAgoISO, parseDateKey, startOfDay } from "@/lib/time";
import type {
  AnimalKind,
  Artwork,
  Bilingual,
  ClassSession,
  Room,
  Student,
  StudioData,
  Teacher,
} from "@/lib/types";
import { PACKAGE_SIZE, PACKAGE_PRICE } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* deterministic pseudo random                                         */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

/* ------------------------------------------------------------------ */
/* teachers, rooms, classes                                            */
/* ------------------------------------------------------------------ */

export const TEACHERS: Teacher[] = [
  {
    id: "t-niloofar",
    name: { en: "Niloofar Ahmadi", fa: "نیلوفر احمدی" },
    role: { en: "Watercolour & gouache", fa: "آبرنگ و گواش" },
    animal: "fawn",
    tint: "#DCC9F0",
    since: 2017,
  },
  {
    id: "t-saman",
    name: { en: "Saman Rahimi", fa: "سامان رحیمی" },
    role: { en: "Drawing & comics", fa: "طراحی و کمیک" },
    animal: "fox",
    tint: "#BCD9EF",
    since: 2019,
  },
  {
    id: "t-yasi",
    name: { en: "Yasaman Tabatabai", fa: "یاسمن طباطبایی" },
    role: { en: "Clay & sculpture", fa: "سفال و مجسمه‌سازی" },
    animal: "bear",
    tint: "#FBD9B6",
    since: 2016,
  },
  {
    id: "t-arash",
    name: { en: "Arash Nouri", fa: "آرش نوری" },
    role: { en: "Printmaking & collage", fa: "چاپ دستی و کلاژ" },
    animal: "owl",
    tint: "#B4E4CC",
    since: 2020,
  },
  {
    id: "t-mahsa",
    name: { en: "Mahsa Karimi", fa: "مهسا کریمی" },
    role: { en: "Little hands, ages 3–6", fa: "دست‌های کوچک، ۳ تا ۶ سال" },
    animal: "bunny",
    tint: "#F7C2CE",
    since: 2018,
  },
];

export const ROOMS: Room[] = [
  {
    id: "r-sunflower",
    name: { en: "Sunflower Room", fa: "اتاق آفتابگردان" },
    note: { en: "Big table, north light", fa: "میز بزرگ، نور شمالی" },
    capacity: 12,
    tint: "#FBE3AE",
  },
  {
    id: "r-bluebird",
    name: { en: "Bluebird Room", fa: "اتاق پرنده آبی" },
    note: { en: "Cosy corner for little ones", fa: "گوشه دنج کوچک‌ترها" },
    capacity: 8,
    tint: "#BCD9EF",
  },
  {
    id: "r-acorn",
    name: { en: "Acorn Studio", fa: "استودیو بلوط" },
    note: { en: "Clay, print and messy work", fa: "سفال، چاپ و کارهای کثیف" },
    capacity: 10,
    tint: "#EBD3C3",
  },
];

interface ClassSeed {
  id: string;
  name: Bilingual;
  level: Bilingual;
  teacherId: string;
  roomId: string;
  day: number;
  start: number;
  end: number;
  ageMin: number;
  ageMax: number;
}

const LEVEL_BEGINNER: Bilingual = { en: "Beginner", fa: "مقدماتی" };
const LEVEL_FIRST: Bilingual = { en: "First steps", fa: "قدم‌های اول" };
const LEVEL_INTER: Bilingual = { en: "Intermediate", fa: "میانی" };
const LEVEL_ALL: Bilingual = { en: "All levels", fa: "همه سطوح" };
const LEVEL_TEEN: Bilingual = { en: "Teen studio", fa: "استودیو نوجوان" };

const CLASS_SEEDS: ClassSeed[] = [
  {
    id: "c-little-hands-a",
    name: { en: "Little Hands", fa: "دست‌های کوچک" },
    level: LEVEL_FIRST,
    teacherId: "t-mahsa",
    roomId: "r-bluebird",
    day: 0,
    start: 9 * 60,
    end: 10 * 60,
    ageMin: 4,
    ageMax: 6,
  },
  {
    id: "c-watercolour-a",
    name: { en: "Watercolour Wanderers", fa: "سرگردان‌های آبرنگ" },
    level: LEVEL_BEGINNER,
    teacherId: "t-niloofar",
    roomId: "r-sunflower",
    day: 0,
    start: 10 * 60 + 30,
    end: 12 * 60,
    ageMin: 7,
    ageMax: 9,
  },
  {
    id: "c-comic-a",
    name: { en: "Comic Club", fa: "باشگاه کمیک" },
    level: LEVEL_INTER,
    teacherId: "t-saman",
    roomId: "r-sunflower",
    day: 0,
    start: 16 * 60,
    end: 17 * 60 + 30,
    ageMin: 9,
    ageMax: 12,
  },
  {
    id: "c-clay-a",
    name: { en: "Clay Critters", fa: "جانوران گِلی" },
    level: LEVEL_ALL,
    teacherId: "t-yasi",
    roomId: "r-acorn",
    day: 0,
    start: 17 * 60 + 30,
    end: 19 * 60,
    ageMin: 7,
    ageMax: 10,
  },
  {
    id: "c-draw-a",
    name: { en: "Draw & Doodle", fa: "خط‌خطی و طراحی" },
    level: LEVEL_BEGINNER,
    teacherId: "t-saman",
    roomId: "r-sunflower",
    day: 1,
    start: 9 * 60 + 30,
    end: 11 * 60,
    ageMin: 6,
    ageMax: 8,
  },
  {
    id: "c-finger-a",
    name: { en: "Finger Paint Playgroup", fa: "بازی نقاشی با انگشت" },
    level: LEVEL_FIRST,
    teacherId: "t-mahsa",
    roomId: "r-bluebird",
    day: 1,
    start: 11 * 60,
    end: 12 * 60,
    ageMin: 3,
    ageMax: 4,
  },
  {
    id: "c-print-a",
    name: { en: "Print Lab", fa: "کارگاه چاپ" },
    level: LEVEL_INTER,
    teacherId: "t-arash",
    roomId: "r-acorn",
    day: 1,
    start: 16 * 60,
    end: 17 * 60 + 30,
    ageMin: 10,
    ageMax: 13,
  },
  {
    id: "c-clay-c",
    name: { en: "Clay Critters C", fa: "جانوران گِلی پ" },
    level: LEVEL_ALL,
    teacherId: "t-yasi",
    roomId: "r-acorn",
    day: 1,
    start: 16 * 60 + 30,
    end: 18 * 60,
    ageMin: 7,
    ageMax: 10,
  },
  {
    id: "c-watercolour-b",
    name: { en: "Watercolour Wanderers B", fa: "سرگردان‌های آبرنگ ب" },
    level: LEVEL_BEGINNER,
    teacherId: "t-niloofar",
    roomId: "r-sunflower",
    day: 1,
    start: 17 * 60 + 30,
    end: 19 * 60,
    ageMin: 8,
    ageMax: 10,
  },
  {
    id: "c-little-hands-b",
    name: { en: "Little Hands B", fa: "دست‌های کوچک ب" },
    level: LEVEL_FIRST,
    teacherId: "t-mahsa",
    roomId: "r-bluebird",
    day: 2,
    start: 10 * 60,
    end: 11 * 60,
    ageMin: 4,
    ageMax: 6,
  },
  {
    id: "c-comic-b",
    name: { en: "Comic Club B", fa: "باشگاه کمیک ب" },
    level: LEVEL_INTER,
    teacherId: "t-saman",
    roomId: "r-sunflower",
    day: 2,
    start: 16 * 60,
    end: 17 * 60 + 30,
    ageMin: 9,
    ageMax: 12,
  },
  {
    id: "c-collage-a",
    name: { en: "Collage Stories", fa: "قصه‌های کلاژ" },
    level: LEVEL_ALL,
    teacherId: "t-arash",
    roomId: "r-acorn",
    day: 2,
    start: 17 * 60,
    end: 18 * 60 + 30,
    ageMin: 7,
    ageMax: 9,
  },
  {
    id: "c-draw-b",
    name: { en: "Draw & Doodle B", fa: "خط‌خطی و طراحی ب" },
    level: LEVEL_BEGINNER,
    teacherId: "t-saman",
    roomId: "r-sunflower",
    day: 3,
    start: 9 * 60 + 30,
    end: 11 * 60,
    ageMin: 6,
    ageMax: 8,
  },
  {
    id: "c-clay-b",
    name: { en: "Clay Critters B", fa: "جانوران گِلی ب" },
    level: LEVEL_ALL,
    teacherId: "t-yasi",
    roomId: "r-acorn",
    day: 3,
    start: 11 * 60,
    end: 12 * 60 + 30,
    ageMin: 7,
    ageMax: 10,
  },
  {
    id: "c-watercolour-c",
    name: { en: "Watercolour Wanderers C", fa: "سرگردان‌های آبرنگ ج" },
    level: LEVEL_BEGINNER,
    teacherId: "t-niloofar",
    roomId: "r-sunflower",
    day: 3,
    start: 16 * 60 + 30,
    end: 18 * 60,
    ageMin: 7,
    ageMax: 9,
  },
  {
    id: "c-teen-a",
    name: { en: "Teen Atelier", fa: "آتلیه نوجوان" },
    level: LEVEL_TEEN,
    teacherId: "t-niloofar",
    roomId: "r-sunflower",
    day: 3,
    start: 17 * 60 + 30,
    end: 19 * 60,
    ageMin: 12,
    ageMax: 15,
  },
  {
    id: "c-finger-b",
    name: { en: "Finger Paint Playgroup B", fa: "بازی نقاشی با انگشت ب" },
    level: LEVEL_FIRST,
    teacherId: "t-mahsa",
    roomId: "r-bluebird",
    day: 4,
    start: 10 * 60,
    end: 11 * 60,
    ageMin: 3,
    ageMax: 4,
  },
  {
    id: "c-print-b",
    name: { en: "Print Lab B", fa: "کارگاه چاپ ب" },
    level: LEVEL_INTER,
    teacherId: "t-arash",
    roomId: "r-acorn",
    day: 4,
    start: 16 * 60,
    end: 17 * 60 + 30,
    ageMin: 10,
    ageMax: 13,
  },
  {
    id: "c-comic-c",
    name: { en: "Comic Club C", fa: "باشگاه کمیک ج" },
    level: LEVEL_INTER,
    teacherId: "t-saman",
    roomId: "r-sunflower",
    day: 4,
    start: 17 * 60 + 30,
    end: 19 * 60,
    ageMin: 9,
    ageMax: 12,
  },
  {
    id: "c-little-hands-c",
    name: { en: "Little Hands C", fa: "دست‌های کوچک ج" },
    level: LEVEL_FIRST,
    teacherId: "t-mahsa",
    roomId: "r-bluebird",
    day: 5,
    start: 9 * 60,
    end: 10 * 60,
    ageMin: 4,
    ageMax: 6,
  },
  {
    id: "c-collage-b",
    name: { en: "Collage Stories B", fa: "قصه‌های کلاژ ب" },
    level: LEVEL_ALL,
    teacherId: "t-arash",
    roomId: "r-acorn",
    day: 5,
    start: 10 * 60 + 30,
    end: 12 * 60,
    ageMin: 7,
    ageMax: 9,
  },
  {
    id: "c-teen-b",
    name: { en: "Teen Atelier B", fa: "آتلیه نوجوان ب" },
    level: LEVEL_TEEN,
    teacherId: "t-niloofar",
    roomId: "r-sunflower",
    day: 5,
    start: 16 * 60,
    end: 17 * 60 + 30,
    ageMin: 12,
    ageMax: 15,
  },
  {
    id: "c-watercolour-d",
    name: { en: "Watercolour Wanderers D", fa: "سرگردان‌های آبرنگ د" },
    level: LEVEL_BEGINNER,
    teacherId: "t-niloofar",
    roomId: "r-bluebird",
    day: 5,
    start: 16 * 60 + 30,
    end: 18 * 60,
    ageMin: 8,
    ageMax: 10,
  },
];

export const CLASSES: ClassSession[] = CLASS_SEEDS.map((seed, index) => ({
  ...seed,
  tint: CLASS_TINTS[(index * 7) % CLASS_TINTS.length],
}));

/* ------------------------------------------------------------------ */
/* names                                                               */
/* ------------------------------------------------------------------ */

const FIRST_NAMES: Bilingual[] = [
  { en: "Ava", fa: "آوا" },
  { en: "Raha", fa: "رها" },
  { en: "Sara", fa: "سارا" },
  { en: "Baran", fa: "باران" },
  { en: "Helia", fa: "هلیا" },
  { en: "Mahna", fa: "مهنا" },
  { en: "Nika", fa: "نیکا" },
  { en: "Dorsa", fa: "درسا" },
  { en: "Parnia", fa: "پرنیا" },
  { en: "Kiana", fa: "کیانا" },
  { en: "Elina", fa: "الینا" },
  { en: "Setayesh", fa: "ستایش" },
  { en: "Aylin", fa: "آیلین" },
  { en: "Nazanin", fa: "نازنین" },
  { en: "Shirin", fa: "شیرین" },
  { en: "Parisa", fa: "پریسا" },
  { en: "Maryam", fa: "مریم" },
  { en: "Zahra", fa: "زهرا" },
  { en: "Fatemeh", fa: "فاطمه" },
  { en: "Yasna", fa: "یسنا" },
  { en: "Artemis", fa: "آرتمیس" },
  { en: "Taraneh", fa: "ترانه" },
  { en: "Shekufeh", fa: "شکوفه" },
  { en: "Golsa", fa: "گلسا" },
  { en: "Rana", fa: "رعنا" },
  { en: "Sahar", fa: "سحر" },
  { en: "Leila", fa: "لیلا" },
  { en: "Niyusha", fa: "نیوشا" },
  { en: "Aida", fa: "آیدا" },
  { en: "Hasti", fa: "هستی" },
  { en: "Samyar", fa: "سامیار" },
  { en: "Arman", fa: "آرمان" },
  { en: "Kian", fa: "کیان" },
  { en: "Radin", fa: "رادین" },
  { en: "Barsam", fa: "برسام" },
  { en: "Parsa", fa: "پارسا" },
  { en: "Amirali", fa: "امیرعلی" },
  { en: "Mohammad", fa: "محمد" },
  { en: "Ali", fa: "علی" },
  { en: "Hossein", fa: "حسین" },
  { en: "Reza", fa: "رضا" },
  { en: "Sina", fa: "سینا" },
  { en: "Bardia", fa: "بردیا" },
  { en: "Keyvan", fa: "کیوان" },
  { en: "Mani", fa: "مانی" },
  { en: "Sepehr", fa: "سپهر" },
  { en: "Taha", fa: "طاها" },
  { en: "Yasin", fa: "یاسین" },
  { en: "Artin", fa: "آرتین" },
  { en: "Behrad", fa: "بهراد" },
  { en: "Pouya", fa: "پویا" },
  { en: "Dariush", fa: "داریوش" },
  { en: "Soroush", fa: "سروش" },
  { en: "Farzad", fa: "فرزاد" },
  { en: "Kaveh", fa: "کاوه" },
  { en: "Mehdi", fa: "مهدی" },
  { en: "Nima", fa: "نیما" },
  { en: "Hooman", fa: "هومن" },
  { en: "Yousef", fa: "یوسف" },
  { en: "Abtin", fa: "آبتین" },
];

const SURNAMES: Bilingual[] = [
  { en: "Ahmadi", fa: "احمدی" },
  { en: "Rezaei", fa: "رضایی" },
  { en: "Karimi", fa: "کریمی" },
  { en: "Mohammadi", fa: "محمدی" },
  { en: "Hosseini", fa: "حسینی" },
  { en: "Mousavi", fa: "موسوی" },
  { en: "Rahimi", fa: "رحیمی" },
  { en: "Nouri", fa: "نوری" },
  { en: "Sadeghi", fa: "صادقی" },
  { en: "Jafari", fa: "جعفری" },
  { en: "Akbari", fa: "اکبری" },
  { en: "Sharifi", fa: "شریفی" },
  { en: "Kazemi", fa: "کاظمی" },
  { en: "Moradi", fa: "مرادی" },
  { en: "Tehrani", fa: "تهرانی" },
  { en: "Shirazi", fa: "شیرازی" },
  { en: "Esfahani", fa: "اصفهانی" },
  { en: "Tabrizi", fa: "تبریزی" },
  { en: "Yazdi", fa: "یزدی" },
  { en: "Kermani", fa: "کرمانی" },
  { en: "Soltani", fa: "سلطانی" },
  { en: "Farhadi", fa: "فرهادی" },
  { en: "Amini", fa: "امینی" },
  { en: "Bahrami", fa: "بهرامی" },
  { en: "Khosravi", fa: "خسروی" },
  { en: "Dehghan", fa: "دهقان" },
  { en: "Zamani", fa: "زمانی" },
  { en: "Salimi", fa: "سلیمی" },
  { en: "Ghasemi", fa: "قاسمی" },
  { en: "Mahdavi", fa: "مهدوی" },
];

const ANIMALS: AnimalKind[] = [
  "fawn",
  "bunny",
  "bear",
  "cat",
  "fox",
  "owl",
  "chick",
  "panda",
  "koala",
  "mouse",
  "hedgehog",
  "frog",
];

/* ------------------------------------------------------------------ */
/* artwork                                                             */
/* ------------------------------------------------------------------ */

interface ArtworkSource {
  image: string;
  titles: Bilingual[];
}

export const ARTWORK_SOURCES: ArtworkSource[] = [
  {
    image: "/manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-1.webp",
    titles: [
      { en: "Rainbow House", fa: "خانه رنگین‌کمان" },
      { en: "The Day It Rained Colours", fa: "روزی که رنگ بارید" },
    ],
  },
  {
    image: "/manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-2.webp",
    titles: [
      { en: "My Sleepy Cat", fa: "گربه خواب‌آلود من" },
      { en: "Whiskers", fa: "سیبیل" },
    ],
  },
  {
    image: "/manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-3.webp",
    titles: [
      { en: "Rocket to the Moon", fa: "موشک به ماه" },
      { en: "Space Picnic", fa: "پیک‌نیک فضایی" },
    ],
  },
  {
    image: "/manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-4.webp",
    titles: [
      { en: "The Big Blue Fish", fa: "ماهی آبی بزرگ" },
      { en: "Under the Sea", fa: "زیر دریا" },
    ],
  },
  {
    image: "/manus-storage/async-images/qJa0dvJQljKT2Qcbv3QdFg/image-5.webp",
    titles: [
      { en: "Taller Than Me", fa: "بلندتر از من" },
      { en: "Sunflower Family", fa: "خانواده آفتابگردان" },
    ],
  },
  {
    image: "/manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-1.webp",
    titles: [
      { en: "My Friendly Dinosaur", fa: "دایناسور مهربان من" },
      { en: "Dino in the Meadow", fa: "دایناسور در چمنزار" },
    ],
  },
  {
    image: "/manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-2.webp",
    titles: [
      { en: "Wings of Confetti", fa: "بال‌های کاغذرنگی" },
      { en: "The Butterfly Parade", fa: "رژه پروانه‌ها" },
    ],
  },
  {
    image: "/manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-3.webp",
    titles: [
      { en: "Little Boat, Big Sea", fa: "قایق کوچک، دریای بزرگ" },
      { en: "Sail Away", fa: "بادبان‌ها" },
    ],
  },
  {
    image: "/manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-4.webp",
    titles: [
      { en: "Me and My Family", fa: "من و خانواده‌ام" },
      { en: "Three Hugs", fa: "سه بغل" },
    ],
  },
  {
    image: "/manus-storage/async-images/hb3naaVJZqM6PF8jbqCj1B/image-5.webp",
    titles: [
      { en: "Camping Under Stars", fa: "کمپ زیر ستاره‌ها" },
      { en: "Goodnight Moon", fa: "شب بخیر ماه" },
    ],
  },
];

const MEDIUMS: Bilingual[] = [
  { en: "Crayon & oil pastel", fa: "مدادرنگی و پاستل روغنی" },
  { en: "Watercolour", fa: "آبرنگ" },
  { en: "Collage", fa: "کلاژ" },
  { en: "Clay", fa: "سفال" },
  { en: "Printmaking", fa: "چاپ دستی" },
  { en: "Mixed media", fa: "رسانه‌های ترکیبی" },
];

const NOTES: Bilingual[] = [
  {
    en: "Loves mixing colours — hand over the big palette.",
    fa: "عاشق ترکیب رنگ‌هاست — پالت بزرگ را به او بدهید.",
  },
  {
    en: "Needs a quiet minute before starting.",
    fa: "قبل از شروع به یک دقیقه سکوت نیاز دارد.",
  },
  {
    en: "Draws dinosaurs in every corner of the page.",
    fa: "در گوشه‌ی هر صفحه دایناسور می‌کشد.",
  },
  {
    en: "Ready for the next level in the new term.",
    fa: "برای سطح بعدی در ترم جدید آماده است.",
  },
  {
    en: "Very gentle with clay, careful hands.",
    fa: "با گِل خیلی مهربان است، دست‌های دقیقی دارد.",
  },
  {
    en: "Chatty in class — pair with a focused buddy.",
    fa: "در کلاس پرحرف است — کنار یک هم‌گروه متمرکز بنشیند.",
  },
  {
    en: "Sings while painting. Always.",
    fa: "موقع نقاشی آواز می‌خواند. همیشه.",
  },
  {
    en: "Scared of scissors; practise cutting together.",
    fa: "از قیچی می‌ترسد؛ با هم برش زدن را تمرین کنیم.",
  },
];

/* ------------------------------------------------------------------ */
/* students                                                            */
/* ------------------------------------------------------------------ */

function makeArtworks(rng: () => number, studentIndex: number): Artwork[] {
  const count = 3 + Math.floor(rng() * 3); // 3..5
  const usedImages = new Set<number>();
  const artworks: Artwork[] = [];
  let guard = 0;
  while (artworks.length < count && guard < 40) {
    guard += 1;
    const imageIndex = Math.floor(rng() * ARTWORK_SOURCES.length);
    if (usedImages.has(imageIndex)) continue;
    usedImages.add(imageIndex);
    const source = ARTWORK_SOURCES[imageIndex];
    const title = pick(rng, source.titles);
    const daysAgo = 2 + Math.floor(rng() * 80);
    artworks.push({
      id: `aw-${studentIndex}-${artworks.length}`,
      title,
      medium: pick(rng, MEDIUMS),
      image: source.image,
      date: daysAgoISO(daysAgo),
    });
  }
  return artworks.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function buildStudents(): Student[] {
  const rng = mulberry32(20261117);
  const students: Student[] = [];
  const loads = new Map<string, number>();
  CLASSES.forEach((c) => loads.set(c.id, 0));

  for (let i = 0; i < 120; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const surname = SURNAMES[(i * 7 + Math.floor(i / FIRST_NAMES.length)) % SURNAMES.length];
    const name: Bilingual = { en: `${first.en} ${surname.en}`, fa: `${first.fa} ${surname.fa}` };

    const ageRoll = rng();
    const age = ageRoll < 0.12 ? 3 + Math.floor(rng() * 2) : ageRoll < 0.62 ? 6 + Math.floor(rng() * 4) : 10 + Math.floor(rng() * 6);

    const eligible = CLASSES.filter((c) => age >= c.ageMin && age <= c.ageMax);
    const pool = eligible.length > 0 ? eligible : CLASSES;
    const sorted = [...pool].sort((a, b) => {
      const aLoad = (loads.get(a.id) ?? 0) / a.ageMax;
      const bLoad = (loads.get(b.id) ?? 0) / b.ageMax;
      return aLoad - bLoad;
    });
    const primary = sorted[0];
    loads.set(primary.id, (loads.get(primary.id) ?? 0) + 1);
    const classIds = [primary.id];

    if (rng() < 0.3) {
      const others = sorted.filter((c) => c.id !== primary.id);
      if (others.length > 0) {
        const second = others[Math.floor(rng() * Math.min(3, others.length))];
        classIds.push(second.id);
        loads.set(second.id, (loads.get(second.id) ?? 0) + 1);
      }
    }

    const bucket = rng();
    let remaining: number;
    if (bucket < 0.1) remaining = 0;
    else if (bucket < 0.28) remaining = 1 + Math.floor(rng() * 4);
    else remaining = 5 + Math.floor(rng() * 16);

    const purchased = rng() < 0.34 ? PACKAGE_SIZE * 2 : PACKAGE_SIZE;
    const used = Math.max(0, purchased - remaining);
    const joined = daysAgoISO(120 + Math.floor(rng() * 900));
    const renewals =
      purchased > PACKAGE_SIZE
        ? [
            {
              date: daysAgoISO(30 + Math.floor(rng() * 120)),
              lessons: PACKAGE_SIZE,
              price: PACKAGE_PRICE,
            },
          ]
        : [];

    students.push({
      id: `s-${String(i + 1).padStart(3, "0")}`,
      name,
      age,
      animal: ANIMALS[i % ANIMALS.length],
      tint: CLASS_TINTS[(i * 5) % CLASS_TINTS.length],
      guardian: {
        en: `${pick(rng, FIRST_NAMES.slice(0, 30)).en} ${surname.en}`,
        fa: `${pick(rng, FIRST_NAMES.slice(0, 30)).fa} ${surname.fa}`,
      },
      phone: `0912${String(1000000 + Math.floor(rng() * 8999999)).slice(0, 7)}`,
      joined,
      classIds,
      purchased,
      used,
      renewals,
      artworks: makeArtworks(rng, i),
      note: pick(rng, NOTES),
    });
  }

  return students;
}

const toJsDay = (studioDay: number) => (studioDay + 6) % 7;

/** The most recent occurrences of a weekday, never including today. */
function recentSessionDates(studioDay: number, count: number): string[] {
  const cursor = startOfDay(new Date());
  const diff = (cursor.getDay() - toJsDay(studioDay) + 7) % 7;
  cursor.setDate(cursor.getDate() - (diff === 0 ? 7 : diff));
  const dates: string[] = [];
  for (let i = 0; i < count; i += 1) {
    dates.push(dateKey(cursor));
    cursor.setDate(cursor.getDate() - 7);
  }
  return dates;
}

function buildAttendance(students: Student[], rng: () => number): StudioData["attendance"] {
  const attendance: StudioData["attendance"] = {};
  const byId = new Map(CLASSES.map((cls) => [cls.id, cls]));

  students.forEach((student) => {
    const slots: { classId: string; date: string; start: number }[] = [];
    student.classIds.forEach((classId) => {
      const cls = byId.get(classId);
      if (!cls) return;
      recentSessionDates(cls.day, 5).forEach((date) =>
        slots.push({ classId, date, start: cls.start }),
      );
    });
    slots.sort((a, b) => (a.date === b.date ? b.start - a.start : a.date < b.date ? 1 : -1));

    const recorded = Math.min(student.used, 8);
    slots.slice(0, recorded).forEach((slot) => {
      const status = rng() < 0.08 ? "late" : "present";
      attendance[`${slot.classId}|${slot.date}|${student.id}`] = {
        classId: slot.classId,
        date: slot.date,
        studentId: student.id,
        status,
        markedAt: parseDateKey(slot.date).getTime() + slot.start * 60_000,
      };
    });

    if (student.used >= 3) {
      const extra = slots[recorded];
      if (extra && !attendance[`${extra.classId}|${extra.date}|${student.id}`]) {
        attendance[`${extra.classId}|${extra.date}|${student.id}`] = {
          classId: extra.classId,
          date: extra.date,
          studentId: student.id,
          status: "absent",
          markedAt: parseDateKey(extra.date).getTime() + extra.start * 60_000,
        };
      }
    }
  });

  return attendance;
}

export function createSeedData(): StudioData {
  const students = buildStudents();
  const rng = mulberry32(77123);
  return {
    version: 2,
    students,
    classes: CLASSES,
    teachers: TEACHERS,
    rooms: ROOMS,
    attendance: buildAttendance(students, rng),
  };
}

export const LOOKUPS = {
  teacher: new Map(TEACHERS.map((t) => [t.id, t])),
  room: new Map(ROOMS.map((r) => [r.id, r])),
  klass: new Map(CLASSES.map((c) => [c.id, c])),
};
