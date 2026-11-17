import { EMPTY_BOOK_DETAILS, type BookDetails } from "@/lib/book-details";

/** Default book records (from Daily Essential CMS) used as samples and for one-click import. */
export type BookSeed = {
  title: string;
  slug: string;
  authors: string[];
  year: string;
  excerpt: string;
  cover: string;
  buyUrl: string;
  isNew: boolean;
} & BookDetails;

export const BUNDLED_BOOK_IMPORTS: BookSeed[] = [
  {
    title: "Prevent Sports Injuries",
    slug: "prevent-sports-injuries",
    authors: ["D. Buckky Moral"],
    year: "2026",
    excerpt: "Stay in the game for years, not weeks.",
    description:
      "Stay in the game for years, not weeks.\n\nPrevent Sports Injuries gives young athletes and coaches clear, age-appropriate guidance on warming up, gear, hydration, and recovery — without fear tactics.\n\nYou will learn how to:\n• Choose protective gear that actually fits\n• Build warm-up habits that reduce sprains and strains\n• Spot early warning signs before small aches become season-ending injuries\n• Balance competition drive with rest and smart recovery",
    cover: "/books/prevent-sports-injuries.webp",
    buyUrl: "https://www.amazon.com/",
    isNew: true,
    isbn: "979-8-7654-3210-5",
    pageCount: "216",
    readingAge: "8 - 17 years",
    language: "English",
    format: "Kindle Edition",
    category: "Health, Fitness & Dieting",
    publishedAt: "November 15, 2026",
    publisher: "UMPT Publishing",
    sampleUrl: "",
    price: "$3.70",
  },
  {
    title: "The Kingdom Behind the Rainbow",
    slug: "the-kingdom-behind-the-rainbow",
    authors: ["D. Buckky Moral"],
    year: "2025",
    excerpt:
      "An illustrated adventure behind the rainbow, published as an ebook and paperback on Amazon.",
    cover: "/books/the-kingdom-behind-the-rainbow.webp",
    buyUrl: "https://www.amazon.com/dp/B0HQ4ST9TD",
    isNew: true,
    ...EMPTY_BOOK_DETAILS,
    description:
      "An illustrated adventure behind the rainbow, published as an ebook and paperback on Amazon.",
    format: "Paperback",
    language: "English",
  },
  {
    title: "BUCKKY: Riff Discovers the Mysterious Hat",
    slug: "buckky-riff-discovers-the-mysterious-hat",
    authors: ["D. Buckky Moral"],
    year: "2025",
    excerpt:
      "A mysterious hat. An extraordinary adventure. Meet Riff, a curious adventurer, and Pip, a clever wooden bird, as an unexpected striped hat sparks magic and gentle lessons in responsibility.",
    cover: "/books/buckky-riff-mysterious-hat.webp",
    buyUrl: "https://www.amazon.it/dp/B0HNT4WFBD",
    isNew: true,
    ...EMPTY_BOOK_DETAILS,
    description:
      "A mysterious hat. An extraordinary adventure. Meet Riff, a curious adventurer, and Pip, a clever wooden bird, as an unexpected striped hat sparks magic and gentle lessons in responsibility.",
    format: "Kindle Edition",
    language: "English",
  },
  {
    title: "Zilo and the Mountain of Almost",
    slug: "zilo-and-the-mountain-of-almost",
    authors: ["D. Buckky Moral"],
    year: "2025",
    excerpt:
      "Zilo sets out from Thistledown to climb the snowy summit of Mount Argent with friends Pip and Toma. Along the trek, they discover that the hardest climbs are not only about reaching the top.",
    cover: "/books/zilo-mountain-of-almost.webp",
    buyUrl: "https://www.amazon.com/stores/author/B0HPTRT8FN/about",
    isNew: false,
    ...EMPTY_BOOK_DETAILS,
    description:
      "Zilo sets out from Thistledown to climb the snowy summit of Mount Argent with friends Pip and Toma. Along the trek, they discover that the hardest climbs are not only about reaching the top.",
    format: "Paperback",
    language: "English",
  },
  {
    title: "Zilo and the River That Runs Backwards",
    slug: "zilo-and-the-river-that-runs-backwards",
    authors: ["D. Buckky Moral"],
    year: "2025",
    excerpt:
      "What if a river ran backwards? When the river suddenly flows uphill, Zilo grabs an explorer's hat and follows the splash — with a maze, word search and spot-the-difference along the way.",
    cover: "/books/zilo-river-runs-backwards.webp",
    buyUrl: "https://www.amazon.com/stores/author/B0HPTRT8FN/about",
    isNew: true,
    ...EMPTY_BOOK_DETAILS,
    description:
      "What if a river ran backwards? When the river suddenly flows uphill, Zilo grabs an explorer's hat and follows the splash — with a maze, word search and spot-the-difference along the way.",
    format: "Kindle Edition",
    language: "English",
  },
  {
    title: "Zilo and the Whispering Cave",
    slug: "zilo-and-the-whispering-cave",
    authors: ["D. Buckky Moral"],
    year: "2025",
    excerpt:
      "When Zilo hears a mysterious whisper echoing from a hidden grotto, curiosity and courage turn shadows into wonder. A gentle illustrated tale about bravery, listening, and discovery.",
    cover: "/books/zilo-whispering-cave.webp",
    buyUrl: "https://www.amazon.com/stores/author/B0HPTRT8FN/about",
    isNew: false,
    ...EMPTY_BOOK_DETAILS,
    description:
      "When Zilo hears a mysterious whisper echoing from a hidden grotto, curiosity and courage turn shadows into wonder. A gentle illustrated tale about bravery, listening, and discovery.",
    format: "Paperback",
    language: "English",
  },
];