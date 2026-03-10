import EventManagementHeader from "@/components/EventManagementHeader";

export default function EventManagementHeaderDemoPage() {
    return (
        <div className="min-h-screen bg-gray-50">
        {/* Live component preview */}
        <EventManagementHeader
            eventTitle="Crypto Art Lagos 2025"
            onEditEvent={() => alert("Edit Event clicked")}
            onPreviewEvent={() => alert("Preview Event Page clicked")}
        />

        {/* Optional: page body placeholder */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="h-64 rounded-xl bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
            Event management content goes here
            </div>
        </main>
        </div>
    );
}