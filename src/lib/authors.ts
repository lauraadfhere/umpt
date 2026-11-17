export type Author = {
  id: string;
  name: string;
  affiliation: string;
  publicationCount: number;
  subjects: string[];
  avatarUrl?: string;
  bio?: string;
};

export const AUTHOR_TOTAL = 35173;

export const sampleAuthors: Author[] = [
  {
    id: "1",
    name: "John Smith",
    affiliation: "MIT Computer Science and AI Laboratory",
    publicationCount: 142,
    subjects: ["ai", "ml"],
  },
  {
    id: "2",
    name: "Maria García",
    affiliation: "Universidad Politécnica de Madrid",
    publicationCount: 87,
    subjects: ["hci", "education"],
  },
  {
    id: "3",
    name: "Wei Zhang",
    affiliation: "Tsinghua University",
    publicationCount: 203,
    subjects: ["networks", "systems"],
  },
  {
    id: "4",
    name: "Amélie Dubois",
    affiliation: "INRIA Paris",
    publicationCount: 56,
    subjects: ["security", "theory"],
  },
  {
    id: "5",
    name: "Omar Hassan",
    affiliation: "Cairo University",
    publicationCount: 31,
    subjects: ["data", "software"],
  },
  {
    id: "6",
    name: "Elena Petrov",
    affiliation: "ETH Zürich",
    publicationCount: 98,
    subjects: ["vision", "graphics"],
  },
];

export const SUBJECT_KEYS = [
  "ai",
  "ml",
  "vision",
  "hci",
  "theory",
  "systems",
  "security",
  "data",
  "networks",
  "graphics",
  "software",
  "education",
] as const;