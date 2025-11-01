import { ERROR_MESSAGES } from "./options";
import { checkIsKaiaBrowser } from "./utils";

export function ensureKaiaWalletInstalled() {
  if (typeof window !== "undefined" && !window.klaytn) {
    throw new Error(ERROR_MESSAGES.KAIA_WALLET_NOT_INSTALLED);
  }
}

export function getProvider() {
  return checkIsKaiaBrowser() ? Promise.resolve(window.ethereum) : Promise.resolve(window.klaytn);
}
