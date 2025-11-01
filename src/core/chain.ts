import { Chain, EIP1193Provider, numberToHex } from "viem";

type ProviderType = NonNullable<Awaited<EIP1193Provider>>;

export async function switchChain(provider: ProviderType, chainId: number) {
  const id = numberToHex(chainId);
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: id }],
  });
}

export async function addChain(provider: ProviderType, chain: Chain) {
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: numberToHex(chain.id),
        chainName: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: chain.rpcUrls.default.http,
        blockExplorerUrls: chain.blockExplorers?.default ? [chain.blockExplorers.default.url] : undefined,
      },
    ],
  });
}
