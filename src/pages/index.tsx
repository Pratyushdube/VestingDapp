import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';


const Home: NextPage = () => {
  return (
    // Main container using Tailwind for full height, centering, and background
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700 p-4 font-inter">
      <Head>
        <title>Vesting DApp</title>
        <meta
          content="Web3 DApp for managing vesting schedules"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl text-center">
        {/* Card-like container for the main content, with shadow and rounded corners */}
        <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 max-w-md w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Vesting DApp
          </h1>

          <p className="text-gray-700 text-base sm:text-lg">
            Connect your wallet to get started.
          </p>

          {/* Connect Button */}
          <div className="flex justify-center mt-6">
            <ConnectButton />
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="w-full text-center text-white mt-8 text-sm opacity-80">
        Powered by RainbowKit, Wagmi, and Next.js
      </footer>
    </div>
  );
};

export default Home;
