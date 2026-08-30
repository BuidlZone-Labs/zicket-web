import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CategoryPillBar from "../CategoryPillBar";
import type { CategoryPillValue } from "../categoryFilters";

function ControlledCategoryPillBar() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryPillValue | null>(null);

  return (
    <CategoryPillBar
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    />
  );
}

describe("CategoryPillBar", () => {
  it("renders an accessible category navigation", () => {
    render(<ControlledCategoryPillBar />);

    expect(
      screen.getByRole("navigation", { name: "Event categories" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All events" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("toggles the active pill when a category is selected", () => {
    render(<ControlledCategoryPillBar />);

    const hackathons = screen.getByRole("button", { name: "Hackathons" });
    fireEvent.click(hackathons);

    expect(hackathons).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All events" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    fireEvent.click(screen.getByRole("button", { name: "All events" }));
    expect(screen.getByRole("button", { name: "All events" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
