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

export default async function ExplorePage() {
  // Server-side data fetching for SSR
  const events = await getAllPublicEvents();

  return (
    <div className="bg-white dark:bg-[#0D0D0D] min-h-screen">
      <MainContent initialEvents={events} />
    </div>
  );
}
