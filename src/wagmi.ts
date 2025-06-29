import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  anvil,
  mainnet,
  polygon,
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    anvil,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
