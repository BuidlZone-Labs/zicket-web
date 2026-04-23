type AnalyticsPrimitive = string | number | boolean | null;
type AnalyticsValue = AnalyticsPrimitive | AnalyticsPayload | AnalyticsValue[];

export type AnalyticsPayload = Record<string, AnalyticsValue>;

export interface PrivacyAnalyticsOptions {
  isAnonymous?: boolean;
  trackingAllowed?: boolean;
}

type DataLayerPayload = {
  event: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer?: DataLayerPayload[];
  }
}

const PII_KEY_PATTERN =
  /(user.?id|email|phone|name|identity|wallet|address|profile|contact)/i;

function isPlainObject(value: AnalyticsValue): value is AnalyticsPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stripUserIdentifiers(payload: AnalyticsPayload): AnalyticsPayload {
  const sanitized: AnalyticsPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (PII_KEY_PATTERN.test(key)) {
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        isPlainObject(item) ? stripUserIdentifiers(item) : item
      );
      continue;
    }

    if (isPlainObject(value)) {
      sanitized[key] = stripUserIdentifiers(value);
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

function shouldTrack(options: PrivacyAnalyticsOptions): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (options.trackingAllowed === false || options.isAnonymous === true) {
    return false;
  }

  return true;
}

export function trackAnalyticsEvent(
  eventName: string,
  payload: AnalyticsPayload = {},
  options: PrivacyAnalyticsOptions = {}
): void {
  if (!eventName || !shouldTrack(options)) {
    return;
  }

  const sanitizedPayload = stripUserIdentifiers(payload);
  const eventPayload: DataLayerPayload = {
    event: eventName,
    ...sanitizedPayload,
  };

  window.dataLayer?.push(eventPayload);
}
