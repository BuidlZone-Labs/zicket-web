"use client";

import React from "react";
import Image from "next/image";

interface EventManagementHeaderProps {
    eventLogo?: string;
    eventTitle?: string;
    onEditEvent?: () => void;
    onPreviewEvent?: () => void;
}

const EditIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
    );

    const PreviewIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
    );

    const EventManagementHeader: React.FC<EventManagementHeaderProps> = ({
    eventLogo,
    eventTitle = "Crypto Art Lagos 2025",
    onEditEvent,
    onPreviewEvent,
    }) => {
    return (
        <header className="w-full bg-background border-b border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

            {/* Left section: Logo + Event Meta */}
            <div className="flex items-center gap-4 flex-1 min-w-0">

            {/* Event Logo */}
            <div
                className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center border border-border"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, white)" }}
            >
                {eventLogo ? (
                <Image
                    src={eventLogo}
                    alt={`${eventTitle} logo`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                />
                ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--color-primary)" }}
                    aria-hidden="true"
                >
                    <path d="M2 7l10-5 10 5v10l-10 5L2 17V7z" />
                    <path d="M12 2v20M2 7l10 5 10-5" />
                </svg>
                )}
            </div>

            {/* Event Meta */}
            <div className="min-w-0">
                <p
                className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                style={{ color: "var(--color-primary)" }}
                >
                Manage Event:
                </p>
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold truncate text-foreground">
                {eventTitle}
                </h1>
            </div>
            </div>

            {/* Right section: Action Buttons */}
            <div className="flex items-center gap-3 sm:flex-shrink-0">

            {/* Edit Event — Primary filled button */}
            <button
                onClick={onEditEvent}
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer whitespace-nowrap"
                style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--primary-foreground)",
                border: "1px solid var(--color-primary)",
                }}
                onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary-dark)";
                e.currentTarget.style.borderColor = "var(--color-primary-dark)";
                }}
                onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                aria-label="Edit Event"
            >
                <EditIcon />
                Edit Event
            </button>

            {/* Preview Event Page — Secondary outlined button */}
            <button
                onClick={onPreviewEvent}
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer whitespace-nowrap bg-transparent"
                style={{
                color: "var(--color-primary)",
                border: "1px solid var(--color-primary)",
                }}
                onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--color-primary) 8%, transparent)";
                e.currentTarget.style.color = "var(--color-primary-dark)";
                e.currentTarget.style.borderColor = "var(--color-primary-dark)";
                }}
                onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--color-primary)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                aria-label="Preview Event Page"
            >
                <PreviewIcon />
                Preview Event Page
            </button>
            </div>

        </div>
        </header>
    );
};

export default EventManagementHeader;