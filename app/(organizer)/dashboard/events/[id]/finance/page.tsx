import { redirect } from "next/navigation";

/**
 * Alias for the path named in the settlement spec. The organizer area is
 * served under `/zkorg`, which is where the nav chrome lives (see
 * `app/(organizer)/zkorg/layout.tsx`) — rendering a second copy of the page
 * here would drop that chrome and split the route in two, so this forwards
 * instead and the dashboard has exactly one implementation.
 */
export default async function OrganizerEventFinanceAlias({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/zkorg/events/${encodeURIComponent(id)}/finance`);
}
