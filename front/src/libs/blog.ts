import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type Entries = CollectionEntry<"blog">[];
export async function getAllEntries(): Promise<Entries> {
  return await getCollection("blog");
}
export async function getAllEntriesWithTag(tag: string): Promise<Entries> {
  var allEntries = await getCollection("blog");
  return allEntries.filter((entry) => entry.data.tags.includes(tag));
}
export async function getAllEntryTags(): Promise<string[]> {
  var allEntries = await getCollection("blog");
  return [
    ...new Set(
      allEntries.flatMap((entry) => entry.data.tags || []),
    ),
  ].sort();
}
export function sortEntriesByDateDesc(entries: Entries) {
  return entries.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}
