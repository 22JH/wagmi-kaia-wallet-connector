export const DEFAULT_OPTIONS = {
  ID: "Kaia",
  NAME: "Kaia",
  TYPE: "Kaia",
} as const;

export const ERROR_MESSAGES = {
  KAIA_WALLET_NOT_INSTALLED: "Kaia wallet is not installed.",
  ALREADY_CONNECTING: "Kaia wallet is already connecting",
  CHAIN_NOT_SUPPORTED: "Chain not supported by this Connector",
  USER_REJECTED_SWITCH_AFTER_ADDING_NETWORK: "User rejected switch after adding network.",
} as const;
