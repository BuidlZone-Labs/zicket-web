import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PrivacyBadge } from "../PrivacyBadge";

describe("PrivacyBadge component", () => {
  it("renders Anonymous badge with correct label and attributes", () => {
    render(<PrivacyBadge level="Anonymous" />);

    const badge = screen.getByRole("button", {
      name: /Privacy level: Anonymous/i,
    });
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });

  it("renders Private / Verified Access badge correctly", () => {
    render(<PrivacyBadge level="Private" />);

    const badge = screen.getByRole("button", {
      name: /Privacy level: Private/i,
    });
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("renders Standard / Wallet Required badge correctly", () => {
    render(<PrivacyBadge level="Standard" />);

    const badge = screen.getByRole("button", {
      name: /Privacy level: Standard/i,
    });
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  it("supports custom displayLabel like 'Wallet Required'", () => {
    render(<PrivacyBadge level="Wallet Required" displayLabel="Wallet Required" />);

    expect(screen.getByText("Wallet Required")).toBeInTheDocument();
  });

  it("renders 'Learn More' when showLearnMore is true", () => {
    render(<PrivacyBadge level="Anonymous" showLearnMore={true} />);

    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  it("opens PrivacyDisclosureModal on click and prevents event propagation", () => {
    const parentClickMock = vi.fn();

    render(
      <div onClick={parentClickMock} data-testid="parent-container">
        <PrivacyBadge level="Anonymous" />
      </div>,
    );

    const badge = screen.getByRole("button", {
      name: /Privacy level: Anonymous/i,
    });
    fireEvent.click(badge);

    // Parent click handler should not be triggered due to stopPropagation
    expect(parentClickMock).not.toHaveBeenCalled();

    // Modal should now be open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/Anonymous Privacy Architecture/i),
    ).toBeInTheDocument();
  });

  it("opens PrivacyDisclosureModal on keyboard Enter and Space keys", () => {
    render(<PrivacyBadge level="Private" />);

    const badge = screen.getByRole("button", {
      name: /Privacy level: Private/i,
    });

    fireEvent.keyDown(badge, { key: "Enter" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Private Privacy Architecture/i)).toBeInTheDocument();
  });

  it("does not open modal when interactive is false", () => {
    render(<PrivacyBadge level="Anonymous" interactive={false} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();

    fireEvent.click(status);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
