"use client";

import * as React from "react";
import { useState } from "react";
import { ShieldCheck, Lock, Key, Info } from "lucide-react";
import {
  type PrivacyMode,
  normalizePrivacyLevel,
  getPrivacyConfig,
  type CanonicalPrivacyLevel,
} from "./constants";
import { PrivacyDisclosureModal } from "./PrivacyDisclosureModal";
import { AppTooltip } from "@/components/ui/app-tooltip";
import type { PrivacyLevel } from "@/lib/dummyEvents/events";

export interface PrivacyBadgeProps {
  level?: PrivacyMode | PrivacyLevel | string;
  variant?: "default" | "compact" | "pill" | "subtle" | "outline" | "card-overlay";
  interactive?: boolean;
  showLearnMore?: boolean;
  showInfoIcon?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
  displayLabel?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
}

export function PrivacyBadge({
  level = "Anonymous",
  variant = "default",
  interactive = true,
  showLearnMore = false,
  showInfoIcon = true,
  showTooltip = true,
  tooltipText,
  displayLabel,
  className = "",
  onClick,
  size = "md",
}: PrivacyBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canonicalMode: CanonicalPrivacyLevel = normalizePrivacyLevel(level);
  const config = getPrivacyConfig(canonicalMode);

  // Label to show: either explicit displayLabel, or formatted version of original level if specified
  const label = displayLabel || (typeof level === "string" && level.length > 0 ? level : config.label);
  const resolvedTooltip = tooltipText || `${config.guaranteeText} Click for full disclosure.`;

  const getIcon = () => {
    const iconSizeClass =
      size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4";

    switch (canonicalMode) {
      case "Anonymous":
        return (
          <ShieldCheck
            className={`${iconSizeClass} ${config.badgeTheme.iconColorClass} shrink-0`}
            aria-hidden="true"
          />
        );
      case "Private":
        return (
          <Lock
            className={`${iconSizeClass} ${config.badgeTheme.iconColorClass} shrink-0`}
            aria-hidden="true"
          />
        );
      case "Standard":
        return (
          <Key
            className={`${iconSizeClass} ${config.badgeTheme.iconColorClass} shrink-0`}
            aria-hidden="true"
          />
        );
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
    setIsModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  // Base styling depending on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "card-overlay":
        return "bg-white/95 dark:bg-[#0E0E10]/95 backdrop-blur-md border border-[#E9E9E9] dark:border-[#26262D] text-[#1E1E1E] dark:text-white shadow-sm hover:border-[#6917AF]/40 dark:hover:border-[#D7B5F5]/40";
      case "pill":
        return `${config.badgeTheme.pillBgClass} border border-transparent shadow-xs`;
      case "subtle":
        return "bg-transparent border border-[#E5E7EB] dark:border-[#2E2E38] text-[#4B5563] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5";
      case "outline":
        return "bg-transparent border border-current hover:bg-black/5 dark:hover:bg-white/5";
      case "compact":
        return "bg-white dark:bg-[#15151A] border border-[#E5E7EB] dark:border-[#26262D] text-[#374151] dark:text-[#E5E7EB]";
      case "default":
      default:
        return "bg-white dark:bg-[#121216] border border-[#E5E7EB] dark:border-[#26262F] text-[#1F2937] dark:text-[#F3F4F6] shadow-xs hover:border-[#6917AF]/30 dark:hover:border-[#751AC6]/50";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-2.5 py-1 text-[11px] gap-1.5 rounded-lg";
      case "lg":
        return "px-4 py-2 text-sm gap-2.5 rounded-xl";
      case "md":
      default:
        return "px-3 py-1.5 text-xs gap-2 rounded-xl";
    }
  };

  const infoIconSize = size === "sm" ? "size-3" : size === "lg" ? "size-4" : "size-3.5";

  const badgeElement = (
    <div
      role={interactive ? "button" : "status"}
      tabIndex={interactive ? 0 : undefined}
      aria-haspopup={interactive ? "dialog" : undefined}
      aria-expanded={interactive ? isModalOpen : undefined}
      aria-label={`Privacy level: ${label}. ${config.guaranteeText} Click to view data disclosure guarantees.`}
      title={showTooltip ? undefined : config.guaranteeText}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center font-semibold tracking-tight transition-all duration-150 select-none group/badge ${getVariantStyles()} ${getSizeStyles()} ${
        interactive
          ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#6917AF]/40 dark:focus:ring-[#D7B5F5]/40"
          : ""
      } ${className}`}
    >
      {/* Icon & Label */}
      <span className="flex items-center gap-1.5">
        {getIcon()}
        <span>{label}</span>
      </span>

      {/* Info indicator icon */}
      {showInfoIcon && !showLearnMore && interactive && (
        <span
          className="ml-0.5 flex items-center justify-center text-current/50 group-hover/badge:text-[#6917AF] dark:group-hover/badge:text-[#D7B5F5] transition-colors"
          aria-hidden="true"
        >
          <Info className={infoIconSize} />
        </span>
      )}

      {/* Learn More label if explicitly requested */}
      {showLearnMore && (
        <span className="inline-flex items-center gap-1 ml-1 pl-1.5 border-l border-current/20 text-[11px] font-medium text-[#6917AF] dark:text-[#D7B5F5] group-hover/badge:underline">
          <span>Learn More</span>
          <Info className="size-3" aria-hidden="true" />
        </span>
      )}
    </div>
  );

  return (
    <>
      {showTooltip ? (
        <AppTooltip label={resolvedTooltip} side="top" delayDuration={150}>
          {badgeElement}
        </AppTooltip>
      ) : (
        badgeElement
      )}

      {interactive && (
        <PrivacyDisclosureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialLevel={canonicalMode}
        />
      )}
    </>
  );
}

