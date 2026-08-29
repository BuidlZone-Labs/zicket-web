import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  getNetwork: vi.fn(),
  signTransaction: vi.fn(),
}));

vi.mock("@albedo-link/intent", () => ({
  default: {
    publicKey: vi.fn(),
    tx: vi.fn(),
  },
}));

// Shared mocks, hoisted above the vi.mock factory so individual tests can
// reconfigure return values (a fresh `new Server()` per signAndSubmit() call
// means per-instance mocks can't be reached from the test body otherwise).
const { getAccountMock, prepareTransactionMock, sendTransactionMock } = vi.hoisted(() => ({
  getAccountMock: vi.fn(async (publicKey: string) => ({ accountId: () => publicKey })),
  prepareTransactionMock: vi.fn(async () => ({ toXDR: () => "PREPARED_XDR" })),
  sendTransactionMock: vi.fn(async () => ({ status: "PENDING", hash: "FAKE_TX_HASH" })),
}));

vi.mock("@stellar/stellar-sdk", () => {
  class FakeContract {
    constructor(public id: string) {}
    call(method: string, ...args: unknown[]) {
      return { type: "invokeContract", method, args };
    }
  }

  class FakeTransactionBuilder {
    static fromXDR = vi.fn((xdr: string) => ({ __fromXDR: xdr }));
    addOperation() {
      return this;
    }
    setTimeout() {
      return this;
    }
    build() {
      return { toXDR: () => "UNSIGNED_XDR" };
    }
  }

  class FakeServer {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
    getAccount = getAccountMock;
    prepareTransaction = prepareTransactionMock;
    sendTransaction = sendTransactionMock;
  }

  return {
    Address: class {
      constructor(public value: string) {}
    },
    BASE_FEE: "100",
    Contract: FakeContract,
    Networks: {
      TESTNET: "Test SDF Network ; September 2015",
      PUBLIC: "Public Global Stellar Network ; September 2015",
      FUTURENET: "Test SDF Future Network ; October 2022",
    },
    TransactionBuilder: FakeTransactionBuilder,
    nativeToScVal: vi.fn((val: unknown) => ({ __scval: val })),
    rpc: { Server: FakeServer },
    xdr: {},
  };
});

import * as freighterApi from "@stellar/freighter-api";
import albedo from "@albedo-link/intent";
import { useStellarWallet } from "../useStellarWallet";

const freighter = vi.mocked(freighterApi);
const albedoMock = vi.mocked(albedo);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useStellarWallet -- Freighter connection", () => {
  it("connects successfully and exposes the public key + network", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GATTENDEE...ADDR" });
    freighter.getNetwork.mockResolvedValue({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    const { result } = renderHook(() => useStellarWallet());

    await act(async () => {
      await result.current.connect("freighter");
    });

    expect(result.current.walletId).toBe("freighter");
    expect(result.current.publicKey).toBe("GATTENDEE...ADDR");
    expect(result.current.network).toBe("TESTNET");
    expect(result.current.error).toBeNull();
    expect(result.current.isConnecting).toBe(false);
  });

  it("surfaces a clear error when the Freighter extension isn't installed", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: false });

    const { result } = renderHook(() => useStellarWallet());

    await act(async () => {
      await expect(result.current.connect("freighter")).rejects.toThrow(
        /Freighter wallet extension not found/
      );
    });

    expect(result.current.publicKey).toBeNull();
    expect(result.current.error).toMatch(/Freighter wallet extension not found/);
  });

  it("surfaces the rejection message when the user declines the access prompt", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({
      address: "",
      error: { code: -4, message: "User declined access" },
    });

    const { result } = renderHook(() => useStellarWallet());

    await act(async () => {
      await expect(result.current.connect("freighter")).rejects.toThrow(
        "User declined access"
      );
    });

    expect(result.current.publicKey).toBeNull();
    expect(result.current.error).toBe("User declined access");
  });
});

describe("useStellarWallet -- Albedo connection", () => {
  it("connects via Albedo and defaults to testnet", async () => {
    albedoMock.publicKey.mockResolvedValue({ pubkey: "GALBEDO...ADDR" } as never);

    const { result } = renderHook(() => useStellarWallet());

    await act(async () => {
      await result.current.connect("albedo");
    });

    expect(result.current.walletId).toBe("albedo");
    expect(result.current.publicKey).toBe("GALBEDO...ADDR");
    expect(result.current.network).toBe("TESTNET");
  });

  it("throws when Albedo doesn't return a public key", async () => {
    albedoMock.publicKey.mockResolvedValue({ pubkey: "" } as never);

    const { result } = renderHook(() => useStellarWallet());

    await act(async () => {
      await expect(result.current.connect("albedo")).rejects.toThrow(/Couldn't reach Albedo/);
    });
  });
});

describe("useStellarWallet -- signing and submitting", () => {
  async function connectFreighter() {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GATTENDEE...ADDR" });
    freighter.getNetwork.mockResolvedValue({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    const { result } = renderHook(() => useStellarWallet());
    await act(async () => {
      await result.current.connect("freighter");
    });
    return result;
  }

  it("registerForEvent builds, signs, and submits, returning the tx hash", async () => {
    const result = await connectFreighter();
    freighter.signTransaction.mockResolvedValue({
      signedTxXdr: "SIGNED_XDR",
      signerAddress: "GATTENDEE...ADDR",
    });

    let txHash = "";
    await act(async () => {
      txHash = await result.current.registerForEvent({
        contractId: "CCONTRACT...ID",
        eventId: "evt_123",
      });
    });

    expect(txHash).toBe("FAKE_TX_HASH");
    expect(freighter.signTransaction).toHaveBeenCalledWith(
      "PREPARED_XDR",
      expect.objectContaining({ address: "GATTENDEE...ADDR" })
    );
  });

  it("throws when the wallet rejects the signature", async () => {
    const result = await connectFreighter();
    freighter.signTransaction.mockResolvedValue({
      signedTxXdr: "",
      signerAddress: "",
      error: { code: -4, message: "User declined sign transaction" },
    });

    await act(async () => {
      await expect(
        result.current.registerForEvent({ contractId: "CCONTRACT...ID", eventId: "evt_123" })
      ).rejects.toThrow("User declined sign transaction");
    });
  });

  it("throws when the network rejects the submitted transaction", async () => {
    const result = await connectFreighter();
    freighter.signTransaction.mockResolvedValue({
      signedTxXdr: "SIGNED_XDR",
      signerAddress: "GATTENDEE...ADDR",
    });

    sendTransactionMock.mockResolvedValueOnce({
      status: "ERROR",
      hash: "",
      errorResult: { toString: () => "tx_bad_auth" },
    } as never);

    await act(async () => {
      await expect(
        result.current.registerForEvent({ contractId: "CCONTRACT...ID", eventId: "evt_123" })
      ).rejects.toThrow("tx_bad_auth");
    });
  });

  it("registers immediately after connect using the returned snapshot", async () => {
    // Regression test: registerForEvent must use the wallet snapshot
    // connect() returns, not the hook's `state` closure, which hasn't
    // re-rendered yet in a connect-then-register call within the same tick.
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GATTENDEE...ADDR" });
    freighter.getNetwork.mockResolvedValue({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    freighter.signTransaction.mockResolvedValue({
      signedTxXdr: "SIGNED_XDR",
      signerAddress: "GATTENDEE...ADDR",
    });

    const { result } = renderHook(() => useStellarWallet());

    let txHash = "";
    await act(async () => {
      const connected = await result.current.connect("freighter");
      txHash = await result.current.registerForEvent({
        contractId: "CCONTRACT...ID",
        eventId: "evt_123",
        wallet: connected,
      });
    });

    expect(txHash).toBe("FAKE_TX_HASH");
  });

  it("requires a connected wallet before signing", async () => {
    const { result } = renderHook(() => useStellarWallet());

    await act(async () => {
      await expect(
        result.current.registerForEvent({ contractId: "CCONTRACT...ID", eventId: "evt_123" })
      ).rejects.toThrow(/Connect a wallet/);
    });
  });
});

describe("useStellarWallet -- disconnect", () => {
  it("resets state back to idle", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GATTENDEE...ADDR" });
    freighter.getNetwork.mockResolvedValue({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    const { result } = renderHook(() => useStellarWallet());
    await act(async () => {
      await result.current.connect("freighter");
    });
    expect(result.current.publicKey).not.toBeNull();

    act(() => {
      result.current.disconnect();
    });

    await waitFor(() => expect(result.current.publicKey).toBeNull());
  });
});