export function explorePathForEventTitle(title: string): string {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return `/explore/${slug}`;
}
