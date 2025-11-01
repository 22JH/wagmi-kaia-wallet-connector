import Caver from "caver-js";
import { createConnector } from "wagmi";
import { UserRejectedRequestError, getAddress, ProviderRpcError, type EIP1193Provider } from "viem";
import { type Connector, ConnectorNotConnectedError } from "@wagmi/core";
import { DEFAULT_OPTIONS, ERROR_MESSAGES } from "./core/options";
import {
  getProvider,
  ensureKaiaWalletInstalled,
  emitDisconnect,
  emitChainChange,
  emitAccountsChange,
  switchChain,
  addChain,
} from "./core";

interface KaiaWalletConnectorProps {
  onErrorCallBack?: (error: Error) => void;
}

let chainChanged: Connector["onChainChanged"] | undefined;
let isConnecting: Connector["onConnecting"] | undefined;

export function kaiaWalletConnector({ onErrorCallBack }: KaiaWalletConnectorProps = {}) {
  let caver: Caver | undefined;

  return createConnector((config) => ({
    id: DEFAULT_OPTIONS.ID,
    name: DEFAULT_OPTIONS.NAME,
    type: DEFAULT_OPTIONS.TYPE,

    async setup() {
      ensureKaiaWalletInstalled();
    },

    async connect<withCapabilities extends boolean = false>({
      chainId,
      withCapabilities,
    }: {
      chainId?: number;
      isReconnecting?: boolean;
      withCapabilities?: withCapabilities | boolean;
    } = {}): Promise<{
      accounts: withCapabilities extends true
        ? readonly { address: `0x${string}`; capabilities: Record<string, unknown> }[]
        : readonly `0x${string}`[];
      chainId: number;
    }> {
      if (isConnecting) {
        throw new Error(ERROR_MESSAGES.ALREADY_CONNECTING);
      }
      isConnecting = true;
      caver = new Caver(window.klaytn as any);

      try {
        await config.storage?.removeItem(`${this.id}.disconnected`);

        const accounts = await this.getAccounts();
        let currentChainId = await this.getChainId();

        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({ chainId });
          currentChainId = chain.id;
        }

        if (!chainChanged) {
          chainChanged = this.onChainChanged.bind(this);
        }

        if (withCapabilities) {
          return {
            accounts: accounts.map((address) => ({ address, capabilities: {} })) as readonly {
              address: `0x${string}`;
              capabilities: Record<string, unknown>;
            }[],
            chainId: currentChainId,
          } as unknown as {
            accounts: withCapabilities extends true
              ? readonly { address: `0x${string}`; capabilities: Record<string, unknown> }[]
              : readonly `0x${string}`[];
            chainId: number;
          };
        }

        return {
          accounts: accounts as readonly `0x${string}`[],
          chainId: currentChainId,
        } as unknown as {
          accounts: withCapabilities extends true
            ? readonly { address: `0x${string}`; capabilities: Record<string, unknown> }[]
            : readonly `0x${string}`[];
          chainId: number;
        };
      } catch (error) {
        throw new UserRejectedRequestError(error as Error);
      } finally {
        isConnecting = false;
      }
    },

    async disconnect() {
      await config.storage?.setItem(`${this.id}.disconnected`, true);
      return emitDisconnect(config.emitter);
    },

    async getAccounts() {
      if (!caver) throw new ConnectorNotConnectedError();
      const rawAccounts = await caver.klay.getAccounts();
      return rawAccounts.map((account) => getAddress(account));
    },

    async getProvider() {
      return (await getProvider()) as EIP1193Provider;
    },

    async getChainId() {
      if (!caver) throw new ConnectorNotConnectedError();
      return Number(await caver.klay.getChainId());
    },

    async isAuthorized() {
      const isDisconnected = await config.storage?.getItem(`${this.id}.disconnected`);
      if (isDisconnected) return false;
      return window.klaytn?._kaikas?.isEnabled() ?? false;
    },

    async onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else emitAccountsChange(config.emitter, accounts);
    },

    async onChainChanged(chain) {
      emitChainChange(config.emitter, +chain);
    },

    async onDisconnect() {
      emitDisconnect(config.emitter);
    },

    async switchChain({ chainId }: { chainId: number }) {
      const provider = (await this.getProvider()) as EIP1193Provider;
      if (!provider) throw new Error("Connector not found");
      try {
        await switchChain(provider, chainId);
        this.onChainChanged(chainId.toString());
        return config.chains.find((chain) => chain.id === chainId)!;
      } catch (error) {
        const chain = config.chains.find((chain) => chain.id === chainId)!;
        this.onChainChanged("0");
        if (!chain) throw new Error(ERROR_MESSAGES.CHAIN_NOT_SUPPORTED);
        if (
          (error as ProviderRpcError).code === 4902 ||
          (error as ProviderRpcError<{ originalError?: { code: number } }>)?.data?.originalError?.code === 4902
        ) {
          try {
            await addChain(provider, chain);
            const currentChainId = await this.getChainId();
            if (currentChainId !== chainId) throw new Error(ERROR_MESSAGES.USER_REJECTED_SWITCH_AFTER_ADDING_NETWORK);
            return chain;
          } catch (error) {
            throw new Error(error as string);
          }
        } else {
          onErrorCallBack?.(error as Error);
          throw error;
        }
      }
    },
  }));
}
