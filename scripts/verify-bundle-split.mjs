/**
 * Verifies that the wallet SDK does not appear in the initial Next.js bundle.
 *
 * Run after `next build`:
 *   node scripts/verify-bundle-split.mjs
 *
 * Requirements: 1.1, 4.1
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const WALLET_SDK_PACKAGE = "wallet-sdk-package"; // TODO: update when real package is added
const BUILD_MANIFEST = join(process.cwd(), ".next", "build-manifest.json");

if (!existsSync(BUILD_MANIFEST)) {
  console.error("❌  .next/build-manifest.json not found. Run `next build` first.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(BUILD_MANIFEST, "utf-8"));

// Collect all initial-load chunks (pages/_app and pages/_document)
const initialChunks = [
  ...(manifest.pages?.["/_app"] ?? []),
  ...(manifest.pages?.["/_document"] ?? []),
];

const found = initialChunks.some((chunk) => chunk.includes(WALLET_SDK_PACKAGE));

if (found) {
  console.error(
    `❌  "${WALLET_SDK_PACKAGE}" was found in the initial bundle chunks. Lazy loading is NOT working.`
  );
  process.exit(1);
} else {
  console.log(
    `✅  "${WALLET_SDK_PACKAGE}" is NOT in the initial bundle. Bundle split is working correctly.`
  );
}
