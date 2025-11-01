import type Caver from "caver-js";
import { RequestProvider } from "caver-js";
import type { EIP1193Provider } from "viem";
export {};

declare global {
  interface Window {
    klaytn: {
      enable: () => Promise<string[]>;
      isMobile: boolean;
      _kaikas: {
        isEnabled: () => boolean;
      };
    } & RequestProvider &
      EIP1193Provider;

    caver: Caver;
    ethereum?: EIP1193Provider;
  }
}
