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

const SORT_OPTIONS = ["Popular", "Date", "Name", "Price"] as const;
const PRIVACY_OPTIONS = ["Anonymous", "Verified Access", "Wallet Required"] as const;
const PRICE_OPTIONS = ["Free Events Only", "Paid Events Only"] as const;
const DATE_OPTIONS = ["Today", "This Week", "This Month"] as const;
const EVENT_TYPE_OPTIONS = [
  "Music",
  "Tech & Web3",
  "Art & Culture",
  "Business",
  "Health & Wellness",
  "Education",
  "Community",
] as const;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const extractSearchParam = (
  searchParams: SearchParamsRecord,
  key: string
) => {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const getOptionParam = <T extends readonly string[]>(
  searchParams: SearchParamsRecord,
  key: string,
  options: T
): T[number] | null => {
  const value = extractSearchParam(searchParams, key);
  return value && options.includes(value as T[number])
    ? (value as T[number])
    : null;
};

export default async function ExplorePage({ searchParams }: any) {
  const resolvedSearchParams = await searchParams;
  // Server-side data fetching for SSR
  const events = await getAllPublicEvents();

  const initialQuery = {
    privacy: getOptionParam(resolvedSearchParams, "privacy", PRIVACY_OPTIONS),
    price: getOptionParam(resolvedSearchParams, "price", PRICE_OPTIONS),
    location: extractSearchParam(resolvedSearchParams, "location"),
    date: getOptionParam(resolvedSearchParams, "date", DATE_OPTIONS),
    eventType: getOptionParam(
      resolvedSearchParams,
      "eventType",
      EVENT_TYPE_OPTIONS
    ),
    sort: getOptionParam(resolvedSearchParams, "sort", SORT_OPTIONS),
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] min-h-screen">
      <MainContent initialEvents={events} initialQuery={initialQuery} />
    </div>
  );
}
