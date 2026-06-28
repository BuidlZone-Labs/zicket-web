// import Header from "../components/Header";
// import Footer from "../components/Footer";
import MainContent from "../components/explore/MainContent";
import { getAllPublicEvents } from "@/lib/dataFetching";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Events | Zicket",
  description: "Discover and explore amazing events happening around you",
  keywords: "events, explore, discover, community",
};

const extractSearchParam = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) => {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export default async function ExplorePage({ searchParams }: any) {
  // Server-side data fetching for SSR
  const events = await getAllPublicEvents();

  const initialQuery = {
    privacy: extractSearchParam(searchParams, "privacy"),
    price: extractSearchParam(searchParams, "price"),
    location: extractSearchParam(searchParams, "location"),
    date: extractSearchParam(searchParams, "date"),
    eventType: extractSearchParam(searchParams, "eventType"),
    sort: extractSearchParam(searchParams, "sort"),
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] min-h-screen">
      <MainContent initialEvents={events} initialQuery={initialQuery} />
    </div>
  );
}
