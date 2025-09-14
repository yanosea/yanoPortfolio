import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type Entries = CollectionEntry<"blog">[];

export async function getAllEntries(): Promise<Entries> {
  return await getCollection("blog");
}

export function getAllEntryTags(entries: Entries): string[] {
  return [...new Set(entries.flatMap((entry) => entry.data.tags || []))].sort();
}

export function sortEntriesByDateDesc(entries: Entries) {
  return entries.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}
