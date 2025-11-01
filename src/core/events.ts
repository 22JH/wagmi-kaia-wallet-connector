import { getAddress } from "viem";
import { type CreateConnectorFn } from "@wagmi/core";

type ConnectorConfig = Parameters<CreateConnectorFn>[0];

export function emitAccountsChange(emitter: ConnectorConfig["emitter"], accounts: string[]) {
  emitter.emit("change", { accounts: accounts.map((x) => getAddress(x)) });
}

export function emitChainChange(emitter: ConnectorConfig["emitter"], chainId: number) {
  emitter.emit("change", { chainId });
}

export function emitDisconnect(emitter: ConnectorConfig["emitter"]) {
  emitter.emit("disconnect");
}
