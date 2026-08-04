import { test, expect, type Page } from "@playwright/test";

const PAID_EVENT_PATH = "/explore/solana-summer-hackathon";

/**
 * Stubs a Freighter-compatible injected wallet provider before the app loads,
 * so the Stellar wallet adapter (via stellar-wallets-kit) can complete a full
 * connect + sign round trip without a real browser extension installed.
 *
 * NOTE: mirrors Freighter's public injected API shape. Verify method/global
 * names against the installed `@stellar/freighter-api` / wallets-kit version
 * if this test starts failing against a real dependency upgrade.
 */
async function stubFreighterWallet(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { freighterApi: Record<string, unknown> }).freighterApi = {
      isConnected: async () => ({ isConnected: true }),
      isAllowed: async () => ({ isAllowed: true }),
      setAllowed: async () => ({ isAllowed: true }),
      requestAccess: async () => ({ address: "GATESTPUBLICKEYFORE2ETESTINGXXXXXXXXXXXXXXXXXXXXXXXXXX" }),
      getAddress: async () => ({ address: "GATESTPUBLICKEYFORE2ETESTINGXXXXXXXXXXXXXXXXXXXXXXXXXX" }),
      getNetwork: async () => ({ network: "TESTNET", networkPassphrase: "Test SDF Network ; September 2015" }),
      signTransaction: async () => ({ signedTxXdr: "AAAAAgAAAABE2ETESTSIGNEDXDR", signerAddress: "GATESTPUBLICKEYFORE2ETESTINGXXXXXXXXXXXXXXXXXXXXXXXXXX" }),
    };
  });
}

test.describe("Ticket purchase flow", () => {
  test("lets a user pick a ticket, quantity, and reach the wallet connection step", async ({ page }) => {
    await page.goto(PAID_EVENT_PATH);

    await expect(page.getByRole("heading", { name: "Ticket Info" })).toBeVisible();

    // Ticket type selection defaults to the first option; switch to a
    // different one to prove the radio group is interactive.
    const vipOption = page.getByLabel("VIP", { exact: true });
    await vipOption.check();
    await expect(vipOption).toBeChecked();

    // Bump quantity by one.
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByText("2", { exact: true })).toBeVisible();

    // Kick off purchase -> Privacy Trust prompt appears first.
    await page.getByRole("button", { name: /connect wallet to purchase/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: /allow|confirm/i }).click();

    // Wallet selection modal should offer the documented set of wallets.
    const walletModal = page.getByRole("dialog").last();
    await expect(walletModal).toBeVisible();
    await expect(walletModal.getByText(/freighter/i)).toBeVisible();
    await expect(walletModal.getByText(/lobstr/i)).toBeVisible();
    await expect(walletModal.getByText(/wallet ?connect/i)).toBeVisible();
  });

  test("completes a full purchase against a stubbed Freighter wallet", async ({ page }) => {
    await stubFreighterWallet(page);

    // Mock the on-chain status polling endpoint so the test doesn't depend on
    // real chain confirmation timing.
    await page.route("**/api/transactions/*/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "confirmed" }),
      });
    });

    await page.goto(PAID_EVENT_PATH);

    await page.getByRole("button", { name: /connect wallet to purchase/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /allow|confirm/i }).click();

    await page.getByRole("dialog").last().getByText(/freighter/i).click();

    await expect(page.getByRole("button", { name: /ticket confirmed/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
