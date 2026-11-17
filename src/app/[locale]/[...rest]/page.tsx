import { notFound } from "next/navigation";

/** Any address under a locale that no page handles ends in the translated 404 page. */
export default function UnknownPage() {
  notFound();
}
