/**
 * Stellar wallet adapter — connects real browser wallets (Freighter, Lobstr,
 * WalletConnect, xBull, Albedo, Rabet, Hana) through `@creit.tech/stellar-wallets-kit`,
 * which owns wallet discovery/selection and delegates signing to whichever
 * wallet the user picks. This replaces the old `mock_tx_...` random string
 * generator with a real signed transaction submitted to Horizon.
 *
 * NOTE: There is no organizer payout address in the data model yet, so the
 * default (no-argument) `signTransaction()` call signs a minimal self-payment
 * (1 stroop, memo "zicket-ticket") purely to produce a real, verifiable
 * on-chain transaction for the checkout flow. Once ticket purchases have a
 * real destination (organizer wallet + priced asset), build that XDR
 * server-side and pass it into `signTransaction(xdr)` instead.
 */
import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule,
  LobstrModule,
  xBullModule,
  WalletConnectModule,
  WalletConnectAllowedMethods,
  FREIGHTER_ID,
  type ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import {
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
  Horizon,
} from "@stellar/stellar-sdk";
import type { SignedTransactionResult, WalletAccount, WalletAdapter } from "./types";
import { WalletNotInstalledError } from "./types";

const NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet") as "testnet" | "public";
const NETWORK_PASSPHRASE = NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET;
const HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ??
  (NETWORK === "public" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org");
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

function buildModules() {
  const modules = [new FreighterModule(), new LobstrModule(), new xBullModule()];

  // WalletConnect requires a Cloud project id (https://cloud.walletconnect.com) —
  // only register it once one is configured so local/dev setups without it
  // still get Freighter/Lobstr/xBull.
  if (WALLET_CONNECT_PROJECT_ID) {
    modules.push(
      new WalletConnectModule({
        url: typeof window !== "undefined" ? window.location.origin : "https://zicket.app",
        projectId: WALLET_CONNECT_PROJECT_ID,
        method: WalletConnectAllowedMethods.SIGN,
        description: "Zicket — private, on-chain event ticketing",
        name: "Zicket",
        icons: ["https://zicket.app/favicon.ico"],
        network: NETWORK === "public" ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
      })
    );
  }

  return modules;
}

let kit: StellarWalletsKit | null = null;
function getKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network: NETWORK === "public" ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: buildModules(),
    });
  }
  return kit;
}

function getHorizonServer(): Horizon.Server {
  return new Horizon.Server(HORIZON_URL);
}

/** Opens the kit's wallet picker (Freighter / Lobstr / WalletConnect / xBull) and resolves once the user selects one. */
function selectWallet(): Promise<ISupportedWallet> {
  return new Promise((resolve, reject) => {
    getKit()
      .openModal({
        modalTitle: "Connect a Stellar wallet",
        notAvailableText: "Wallet not installed",
        onWalletSelected: (option) => resolve(option),
        onClosed: (err) => {
          if (err) reject(err);
        },
      })
      .catch(reject);
  });
}

class StellarWalletAdapter implements WalletAdapter {
  readonly chain = "stellar" as const;
  private account: WalletAccount | null = null;

  isConnected(): boolean {
    return this.account !== null;
  }

  getAccount(): WalletAccount | null {
    return this.account;
  }

  async connect(): Promise<WalletAccount> {
    const selected = await selectWallet();
    getKit().setWallet(selected.id);

    const { address } = await getKit().getAddress();
    if (!address) {
      throw new WalletNotInstalledError(selected.name);
    }

    this.account = { address, chain: "stellar", walletName: selected.name };
    return this.account;
  }

  async disconnect(): Promise<void> {
    await getKit().disconnect();
    this.account = null;
  }

  async signTransaction(payload?: string): Promise<SignedTransactionResult> {
    if (!this.account) {
      throw new Error("Connect a Stellar wallet before signing a transaction.");
    }

    const server = getHorizonServer();
    const xdr = payload ?? (await this.buildDemoTicketTransaction(server, this.account.address));

    const { signedTxXdr } = await getKit().signTransaction(xdr, {
      address: this.account.address,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const response = await server.submitTransaction(signedTx);

    return { txHash: response.hash, signedPayload: signedTxXdr };
  }

  /** Minimal, real, cheap-to-submit transaction used until ticket purchases have a priced destination wired in. */
  private async buildDemoTicketTransaction(server: Horizon.Server, address: string): Promise<string> {
    const account = await server.loadAccount(address);
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: address,
          asset: Asset.native(),
          amount: "0.0000001",
        })
      )
      .addMemo(Memo.text("zicket-ticket"))
      .setTimeout(180)
      .build();

    return transaction.toXDR();
  }
}

export const stellarWalletAdapter: WalletAdapter = new StellarWalletAdapter();
