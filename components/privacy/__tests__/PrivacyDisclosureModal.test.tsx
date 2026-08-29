import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PrivacyDisclosureModal } from "../PrivacyDisclosureModal";

describe("PrivacyDisclosureModal component", () => {
  it("renders Standard mode with exact PRD guarantee copy", () => {
    render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={vi.fn()}
        initialLevel="Standard"
      />,
    );

    const guaranteeCopy = screen.getByTestId("privacy-guarantee-copy");
    expect(guaranteeCopy).toHaveTextContent(
      "Stellar wallet address public on-chain; organizer receives attendee registration details.",
    );
    expect(
      screen.getByText(/Standard Privacy Architecture/i),
    ).toBeInTheDocument();
    expect(screen.getByText("On-Chain Disclosures")).toBeInTheDocument();
    expect(screen.getByText("Off-Chain Storage")).toBeInTheDocument();
  });

  it("renders Private mode with exact PRD guarantee copy", () => {
    render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={vi.fn()}
        initialLevel="Private"
      />,
    );

    const guaranteeCopy = screen.getByTestId("privacy-guarantee-copy");
    expect(guaranteeCopy).toHaveTextContent(
      "Stellar payment processed on-chain; attendee personal contact details encrypted off-chain.",
    );
    expect(
      screen.getByText(/Private Privacy Architecture/i),
    ).toBeInTheDocument();
  });

  it("renders Anonymous mode with exact PRD guarantee copy", () => {
    render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={vi.fn()}
        initialLevel="Anonymous"
      />,
    );

    const guaranteeCopy = screen.getByTestId("privacy-guarantee-copy");
    expect(guaranteeCopy).toHaveTextContent(
      "Zero-knowledge proof registration; no wallet address or personal identity stored on-chain or off-chain.",
    );
    expect(
      screen.getByText(/Anonymous Privacy Architecture/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Zero-Knowledge Proof \(ZKP\) Guarantee/i),
    ).toBeInTheDocument();
  });

  it("supports aliases like 'Wallet Required' and 'Verified Access'", () => {
    const { rerender } = render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={vi.fn()}
        initialLevel="Wallet Required"
      />,
    );

    expect(screen.getByTestId("privacy-guarantee-copy")).toHaveTextContent(
      "Stellar wallet address public on-chain; organizer receives attendee registration details.",
    );

    rerender(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={vi.fn()}
        initialLevel="Verified Access"
      />,
    );

    expect(screen.getByTestId("privacy-guarantee-copy")).toHaveTextContent(
      "Stellar payment processed on-chain; attendee personal contact details encrypted off-chain.",
    );
  });

  it("allows switching between privacy level tabs", () => {
    render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={vi.fn()}
        initialLevel="Standard"
      />,
    );

    // Initial is Standard
    expect(screen.getByTestId("privacy-guarantee-copy")).toHaveTextContent(
      "Stellar wallet address public on-chain; organizer receives attendee registration details.",
    );

    // Click Anonymous tab
    const anonymousTab = screen.getByRole("tab", { name: /Anonymous/i });
    fireEvent.click(anonymousTab);

    expect(screen.getByTestId("privacy-guarantee-copy")).toHaveTextContent(
      "Zero-knowledge proof registration; no wallet address or personal identity stored on-chain or off-chain.",
    );

    // Click Private tab
    const privateTab = screen.getByRole("tab", { name: /Private/i });
    fireEvent.click(privateTab);

    expect(screen.getByTestId("privacy-guarantee-copy")).toHaveTextContent(
      "Stellar payment processed on-chain; attendee personal contact details encrypted off-chain.",
    );
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();

    render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={handleClose}
        initialLevel="Anonymous"
      />,
    );

    const closeBtn = screen.getByRole("button", {
      name: /Close privacy disclosure modal/i,
    });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when 'I Understand' button is clicked", () => {
    const handleClose = vi.fn();

    render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={handleClose}
        initialLevel="Anonymous"
      />,
    );

    const understandBtn = screen.getByRole("button", {
      name: /I Understand/i,
    });
    fireEvent.click(understandBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("includes proper ARIA dialog attributes", () => {
    render(
      <PrivacyDisclosureModal
        isOpen={true}
        onClose={vi.fn()}
        initialLevel="Anonymous"
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-labelledby", "privacy-modal-title");
    expect(dialog).toHaveAttribute("aria-describedby", "privacy-modal-description");
  });
});
