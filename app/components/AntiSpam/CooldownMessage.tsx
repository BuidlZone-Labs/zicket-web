import { AlertCircle, Timer } from "lucide-react";

interface CooldownMessageProps {
  remainingSeconds: number;
  className?: string;
}

export function CooldownMessage({ remainingSeconds, className = "" }: CooldownMessageProps) {
  if (remainingSeconds <= 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/30 dark:text-amber-300 ${className}`}
    >
      <Timer className="size-4 shrink-0" aria-hidden="true" />
      <span>
        Too fast! Please wait <strong>{remainingSeconds}s</strong> before trying again.
      </span>
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  className?: string;
}

export function ErrorBanner({ message, className = "" }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/30 dark:text-red-400 ${className}`}
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
