import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MainContent from "../MainContent";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/explore",
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/public/svg/svg", () => ({
  ArrowRightIcon: () => <span aria-hidden="true" />,
  EmptyStateIcon: () => <div data-testid="empty-state-icon" />,
}));

describe("MainContent category query synchronization", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    window.history.replaceState({}, "", "/explore?privacy=Anonymous");
  });

  it("updates the category search param while preserving existing filters", async () => {
    render(
      <MainContent
        initialEvents={[]}
        initialQuery={{
          category: null,
          privacy: "Anonymous",
          price: null,
          location: null,
          date: null,
          eventType: null,
          sort: null,
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Hackathons" }));

    await waitFor(() =>
      expect(replaceMock).toHaveBeenLastCalledWith(
        "/explore?privacy=Anonymous&category=hackathon",
        { scroll: false }
      )
    );
  });
});
