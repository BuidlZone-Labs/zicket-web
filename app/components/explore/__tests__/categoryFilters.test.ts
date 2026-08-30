import { describe, expect, it } from "vitest";
import { dummyEvents } from "@/lib/dummyEvents/events";
import { eventMatchesCategory } from "../categoryFilters";

const getEvent = (title: string) => {
  const event = dummyEvents.find((candidate) => candidate.title === title);

  if (!event) {
    throw new Error(`Missing test event: ${title}`);
  }

  return event;
};

describe("eventMatchesCategory", () => {
  it("matches event categories using whole words and meaningful phrases", () => {
    expect(eventMatchesCategory(getEvent("Makerthon Benue"), "hackathon")).toBe(
      true
    );
    expect(
      eventMatchesCategory(getEvent("Lagos Design Week"), "conference")
    ).toBe(true);
    expect(
      eventMatchesCategory(getEvent("Product Weekend Abidjan"), "conference")
    ).toBe(true);
  });

  it("does not confuse substrings or secondary activities with the event category", () => {
    expect(
      eventMatchesCategory(getEvent("Makerthon Benue"), "conference")
    ).toBe(false);
    expect(
      eventMatchesCategory(getEvent("Open Source Fest NG"), "hackathon")
    ).toBe(false);
  });
});
