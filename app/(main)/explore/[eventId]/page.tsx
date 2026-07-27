import { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetailClient from "@/app/components/explore/EventDetailClient";
import EventSlider from "@/app/components/EventSlider";
import { getEventById, getAllEventIds } from "@/lib/dataFetching";
import Link from "next/link";

type Props = {
  params: Promise<{ eventId: string }>;
};

/**
 * Generate static params for all public events
 * This enables static generation (SSG) for better performance
 */
export async function generateStaticParams() {
  const eventIds = await getAllEventIds();
  return eventIds.map((id) => ({
    eventId: id,
  }));
}

/**
 * Generate SEO metadata for each event dynamically
 * This is called at build time for static pages and request time for dynamic pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  
  if (!event) {
    return {
      title: "Event Not Found | Zicket",
      description: "The event you are looking for does not exist.",
    };
  }

  return {
    title: `${event.title} | Zicket`,
    description: event.description,
    keywords: event.tags?.join(", "),
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: "website",
      url: `https://zicket.com/explore/${eventId}`,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: [event.image],
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;
  
  // Server-side data fetching for initial state
  const event = await getEventById(eventId);

  // Return 404 if event not found (for dynamic routes)
  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-15 py-20 px-4">
      <div className="flex gap-1 items-center w-[calc(100vw - 20px)] lg:w-[436px]">
        <Link
          href="/explore"
          className="text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5] capitalize"
        >
          explore
        </Link>
        <span className="text-[#667185]">/</span>
        <p className="w-fit text-xs md:text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5] line-clamp-1 shrink">
          Web3 & Crypto Meetups
        </p>
        <span className="text-[#667185]">/</span>
        <p className="w-1/3 md:w-fit text-sm font-medium text-[#667185] line-clamp-1 shrink min-w-0">
          {event.title}
        </p>
      </div>

      {/* Pass server-fetched event data to client component */}
      <EventDetailClient event={event} />

      <div className="pt-5">
        <EventSlider />
      </div>
    </div>
  );
}