import type { EIP1193Provider } from 'viem'

declare global {
  interface Window {
    klaytn?: EIP1193Provider & {
      _kaikas?: {
        isEnabled: () => boolean
      }
      isMobile?: boolean
    }
    ethereum?: EIP1193Provider
  }
}

export {}

