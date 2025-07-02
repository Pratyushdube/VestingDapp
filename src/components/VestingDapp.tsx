"use client"

import { useState, useMemo, useEffect } from "react"
import { RiAlertFill, RiInformationLine } from "react-icons/ri"
import {
    useChainId,
    useWriteContract,
    useAccount,
    useWaitForTransactionReceipt,
    useReadContracts,
    useReadContract
} from "wagmi"
import { contractABI } from "@/constants"
import { readContract } from "@wagmi/core"  
import { useConfig } from "wagmi"
import { CgSpinner } from "react-icons/cg"
import { waitForTransactionReceipt } from "@wagmi/core"
import { parseEther, formatEther, isAddress, type Address } from 'viem'; // Use viem's utilities for BigInt handling and address validation


// --- Contract Address (Placeholder - replace with your deployed contract address on Anvil) ---
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address; // REPLACE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS ON ANVIL

// --- Anvil Local Chain ID ---
const ANVIL_CHAIN_ID = 31337; // Default Anvil Chain ID

// --- Main App Component ---
// --- Main App Component ---
function VestingDapp() {
  // Wagmi hooks for account and network information
  const { address: account, isConnected, chain } = useAccount();

  // State variables for UI and contract interaction
  const [contractOwner, setContractOwner] = useState<Address | null>(null);
  const [networkMessage, setNetworkMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // State for Create Vesting Schedule form inputs
  const [vestingRecipient, setVestingRecipient] = useState('');
  const [vestingAmount, setVestingAmount] = useState(''); // Amount in ETH
  const [vestingDuration, setVestingDuration] = useState(''); // Duration in seconds
  const [vestingCliffDuration, setVestingCliffDuration] = useState(''); // Cliff duration in seconds

  // State for Check Vested Amount form inputs and result
  const [checkAddress, setCheckAddress] = useState('');
  const [vestedAmount, setVestedAmount] = useState<string | null>(null); // Vested amount in ETH

  // --- Read Contract Calls ---

  // Read the contract owner
  const { data: ownerData, error: ownerError, refetch: refetchOwner } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'owner',
    chainId: ANVIL_CHAIN_ID, // Specify the chain ID
    query: {
      // Use query options for refetching behavior
      enabled: isConnected, // Only fetch if wallet is connected
      staleTime: 5000, // Data considered fresh for 5 seconds
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  useEffect(() => {
    if (typeof ownerData === "string") {
      setContractOwner(ownerData as Address);
    }
    if (ownerError) {
      console.error("Error fetching contract owner:", ownerError);
      setStatusMessage("Failed to fetch contract owner. Ensure contract is deployed to Anvil and address is correct.");
    }
  }, [ownerData, ownerError]);

  // Read the vested amount for a given address
  const { data: vestedAmountData, error: vestedAmountError, refetch: refetchVestedAmount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'checkVestedAmount',
    args: isAddress(checkAddress) ? [checkAddress as Address] : undefined, // Only pass args if valid
    chainId: ANVIL_CHAIN_ID,
    query: {
      enabled: isConnected && isAddress(checkAddress), // Only enable if connected and address is valid
      retry: false  
    },
  });

  // Handle success and error for vested amount
  useEffect(() => {
    if (vestedAmountData !== undefined && vestedAmountData !== null) {
      setVestedAmount(formatEther(vestedAmountData as bigint)); // Ensure you format BigInt from contract correctly
      setStatusMessage(''); // Clear any previous status message on success
    } else if (vestedAmountError) {
      // console.error("Error checking vested amount:", vestedAmountError);
      setVestedAmount(null);
      setStatusMessage("No vesting schedule found for this address.");
      // Explicitly check for the "No vesting schedule found" error message
      // if (vestedAmountError.message.includes("No vesting schedule found for this user")) {
      //   setStatusMessage("No vesting schedule found for this address.");
      // } else {
      //   setStatusMessage(`Failed to check vested amount: ${vestedAmountError?.message || "An unknown error occurred."}`);
      // }
    }
  }, [vestedAmountData, vestedAmountError]);

  // Update contract owner state when ownerData changes
  useEffect(() => {
    if (typeof ownerData === "string") {
      setContractOwner(ownerData as Address);
    }
  }, [ownerData]);

  // Update vested amount state when vestedAmountData changes
  useEffect(() => {
    if (vestedAmountData !== undefined && vestedAmountData !== null) {
      setVestedAmount(formatEther(vestedAmountData as bigint));
    } else {
      setVestedAmount(null);
    }
  }, [vestedAmountData]);

  // Check network on chain change or component mount
  useEffect(() => {
    if (chain) {
      if (chain.id !== ANVIL_CHAIN_ID) {
        setNetworkMessage(`Please switch to Anvil's local network (Chain ID: ${ANVIL_CHAIN_ID}). Current: ${chain.name} (ID: ${chain.id})`);
      } else {
        setNetworkMessage('');
      }
    }
  }, [chain]);

  // --- Write Contract Calls ---

  // Write contract for creating vesting schedule
  const {
    data: createVestingHash, // Transaction hash
    writeContract: createVesting, // Function to trigger the transaction
    isPending: isCreatingVesting, // Loading state before transaction is sent
    isError: isCreateVestingError, // Error state if transaction sending fails
    error: createVestingError, // Error object
  } = useWriteContract();

  // Wait for createVestingSchedule transaction receipt
  const {
    isLoading: isCreateVestingConfirming, // Loading state while waiting for confirmation
    isSuccess: isCreateVestingConfirmed, // Success state once confirmed
    isError: isCreateVestingReceiptError, // Error state if receipt cannot be fetched
    error: createVestingReceiptError, // Error object
  } = useWaitForTransactionReceipt({
    hash: createVestingHash,
  });

  // Handle createVestingSchedule transaction success/failure
  useEffect(() => {
    if (isCreateVestingConfirmed) {
      setStatusMessage('Vesting schedule created successfully!');
      // Clear form inputs after successful transaction
      setVestingRecipient('');
      setVestingAmount('');
      setVestingDuration('');
      setVestingCliffDuration('');
    } else if (isCreateVestingError) {
      console.error("Error creating vesting schedule (sending):", createVestingError);
      setStatusMessage(`Failed to create vesting schedule: ${createVestingError?.message || 'Transaction error.'}`);
    } else if (isCreateVestingReceiptError) {
      console.error("Error confirming vesting schedule:", createVestingReceiptError);
      setStatusMessage(`Failed to confirm vesting schedule: ${createVestingReceiptError?.message || 'Confirmation error.'}`);
    }
  }, [isCreateVestingConfirmed, isCreateVestingError, createVestingError, isCreateVestingReceiptError, createVestingReceiptError]);


  // Handler for Create Vesting Schedule form submission
  const handleCreateVestingSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic form validation
    if (!account) {
      setStatusMessage('Please connect your wallet.');
      return;
    }
    if (networkMessage) {
      setStatusMessage(networkMessage);
      return;
    }
    if (contractOwner && account.toLowerCase() !== contractOwner.toLowerCase()) {
      setStatusMessage('Only the contract owner can create vesting schedules.');
      return;
    }
    if (!isAddress(vestingRecipient)) {
      setStatusMessage('Invalid recipient address.');
      return;
    }
    const amountBigInt = parseEther(vestingAmount); // Convert ETH string to BigInt wei
    if (parseFloat(vestingAmount) <= 0 || amountBigInt <= 0) {
      setStatusMessage('Amount must be greater than zero.');
      return;
    }
    if (parseInt(vestingDuration) <= 0) {
      setStatusMessage('Duration must be greater than zero.');
      return;
    }
    if (parseInt(vestingCliffDuration) < 0) {
      setStatusMessage('Cliff duration cannot be negative.');
      return;
    }

    setStatusMessage('Creating vesting schedule...');
    try {
      // Trigger the write contract call
      createVesting({
        address: contractAddress,
        abi: contractABI,
        functionName: 'createVestingSchedule',
        args: [
          vestingRecipient as Address,
          BigInt(vestingDuration), // Duration as BigInt
          BigInt(vestingCliffDuration), // Cliff duration as BigInt
        ],
        value: amountBigInt, // ETH amount in wei as BigInt
      });
    } catch (error: any) {
//       console.error("Error preparing or sending create vesting schedule transaction:", error);
      setStatusMessage(`Failed to prepare or send transaction: ${error.message}`);
    }
  };


  // Handler for Check Vested Amount form submission
  const handleCheckVestedAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
        setStatusMessage('Please connect your wallet to check.');
        return;
    }
    if (!checkAddress || !isAddress(checkAddress)) {
      setStatusMessage('Please enter a valid address to check.');
      return;
    }
    setStatusMessage('Checking vested amount...');
    try {
      await refetchVestedAmount();
    } catch (error: any) {
//       console.error("Error checking vested amount:", error);
      setVestedAmount(null);
      setStatusMessage(`Failed to check vested amount: ${error?.message || error}`);
    }
  };

  // Write contract for claiming balance
  const {
    data: claimBalanceHash,
    writeContract: claimBalance,
    isPending: isClaimingBalance,
    isError: isClaimBalanceError,
    error: claimBalanceError,
  } = useWriteContract();

  // Wait for claimBalance transaction receipt
  const {
    isLoading: isClaimBalanceConfirming,
    isSuccess: isClaimBalanceConfirmed,
    isError: isClaimBalanceReceiptError,
    error: claimBalanceReceiptError,
  } = useWaitForTransactionReceipt({
    hash: claimBalanceHash,
  });

  // Handle claimBalance transaction success/failure
  useEffect(() => {
    if (isClaimBalanceConfirmed) {
      setStatusMessage('Balance claimed successfully!');
      // Optionally re-check vested amount for the current account after claiming
      if (account && isAddress(account)) {
        // Set checkAddress to current account and refetch
        setCheckAddress(account); // Ensure the checkAddress field shows the current account if not already
        refetchVestedAmount();
      }
    } else if (isClaimBalanceError) {
//       console.error("Error claiming balance (sending):", claimBalanceError);
      setStatusMessage(`Failed to claim balance: ${claimBalanceError?.message || 'Transaction error.'}`);
    } else if (isClaimBalanceReceiptError) {
//       console.error("Error confirming claim balance:", claimBalanceReceiptError);
      setStatusMessage(`Failed to confirm claim balance: ${claimBalanceReceiptError?.message || 'Confirmation error.'}`);
    }
  }, [isClaimBalanceConfirmed, isClaimBalanceError, claimBalanceError, isClaimBalanceReceiptError, claimBalanceReceiptError, account, refetchVestedAmount]);


  // Handler for Claim Balance button click
  const handleClaimBalance = async () => {
    if (!account) {
      setStatusMessage('Please connect your wallet to claim.');
      return;
    }
    if (networkMessage) {
      setStatusMessage(networkMessage);
      return;
    }

    setStatusMessage('Attempting to claim balance...');
    try {
      // Trigger the write contract call
      claimBalance({
        address: contractAddress,
        abi: contractABI,
        functionName: 'claimBalance',
        args: [account], // The user claims for themselves
      });
    } catch (error: any) {
      console.error("Error preparing or sending claim balance transaction:", error);
      setStatusMessage(`Failed to prepare or send transaction: ${error.message}`);
    }
  };

  // Determine overall loading state for status message
  const showLoadingSpinner = isCreatingVesting || isCreateVestingConfirming || isClaimingBalance || isClaimBalanceConfirming;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-8 font-inter">
      <div className="max-w-4xl mx-auto bg-gray-800 bg-opacity-70 rounded-2xl shadow-2xl p-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-purple-300 mb-8">Vesting DApp</h1>

        {/* Wallet Connection & Info Section */}
        <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
            <RiInformationLine className="text-purple-300" /> Wallet & Contract Info
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-lg">
              Connected Account: <span className="font-semibold text-green-300 break-all">{account || 'Not Connected'}</span>
            </p>
            {/* RainbowKit's ConnectButton should handle connection/disconnection.
                Manual disconnect button is typically not needed when using RainbowKit. */}
          </div>
          <p className="text-lg mt-4">
            Contract Owner: <span className="font-semibold text-blue-300 break-all">{contractOwner || 'Loading...'}</span>
            {account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase() && (
              <span className="ml-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">YOU ARE THE OWNER</span>
            )}
          </p>
          {networkMessage && (
            <p className="text-red-400 mt-2 flex items-center gap-2">
              <RiAlertFill /> {networkMessage}
            </p>
          )}
          {statusMessage && (
            <div className={`mt-4 p-3 rounded-lg ${statusMessage.includes('Failed') || statusMessage.includes('Error') || statusMessage.includes('Invalid') ? 'bg-red-500' : 'bg-green-500'} bg-opacity-70 text-sm flex items-center gap-2`}>
              {showLoadingSpinner && <CgSpinner className="animate-spin text-xl" />}
              {statusMessage}
            </div>
          )}
        </div>

        {/* Create Vesting Schedule Section */}
        <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
            <RiInformationLine className="text-purple-300" /> Create Vesting Schedule (Owner Only)
          </h2>
          {/* New conditional message for non-owners */}
                    {isConnected && contractOwner && account && account.toLowerCase() !== contractOwner.toLowerCase() && (
                        <p className="text-yellow-300 mb-4 p-2 rounded-lg bg-yellow-900 bg-opacity-30 flex items-center gap-2">
                            <RiAlertFill /> This action is restricted to the contract owner.
                        </p>
                    )}

          <form onSubmit={handleCreateVestingSchedule} className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-purple-100 text-sm font-bold mb-2">Recipient Address:</label>
              <input
                type="text"
                id="recipient"
                value={vestingRecipient}
                onChange={(e) => setVestingRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-purple-100 text-sm font-bold mb-2">Amount (ETH):</label>
              <input
                type="number"
                id="amount"
                value={vestingAmount}
                onChange={(e) => setVestingAmount(e.target.value)}
                placeholder="e.g., 0.1"
                step="any"
                min="0.000001"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-purple-100 text-sm font-bold mb-2">Duration (Seconds):</label>
              <input
                type="number"
                id="duration"
                value={vestingDuration}
                onChange={(e) => setVestingDuration(e.target.value)}
                placeholder="e.g., 31536000 (1 year)"
                min="1"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="cliffDuration" className="block text-purple-100 text-sm font-bold mb-2">Cliff Duration (Seconds):</label>
              <input
                type="number"
                id="cliffDuration"
                value={vestingCliffDuration}
                onChange={(e) => setVestingCliffDuration(e.target.value)}
                placeholder="e.g., 2592000 (1 month)"
                min="0"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              disabled={!account || !isConnected || isCreatingVesting || isCreateVestingConfirming || (contractOwner && account.toLowerCase() !== contractOwner.toLowerCase()) || !!networkMessage}
            >
              {(isCreatingVesting || isCreateVestingConfirming) ? <CgSpinner className="animate-spin inline-block mr-2" /> : ''}
              {(isCreatingVesting || isCreateVestingConfirming) ? 'Creating...' : 'Create Schedule'}
            </button>
          </form>
        </div>

        {/* Check Vested Amount Section */}
        <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
            <RiInformationLine className="text-purple-300" /> Check Vested Amount
          </h2>
          <form onSubmit={handleCheckVestedAmount} className="space-y-4">
            <div>
              <label htmlFor="checkAddress" className="block text-purple-100 text-sm font-bold mb-2">Address to Check:</label>
              <input
                type="text"
                id="checkAddress"
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
              disabled={!isConnected || !isAddress(checkAddress)} // Enable only if connected and address is valid
            >
              Check Vested
            </button>
          </form>
          {vestedAmount !== null && (
            <p className="mt-4 text-lg text-center text-teal-300">
              Vested Amount: <span className="font-bold">{vestedAmount}</span> ETH
            </p>
          )}
        </div>

        {/* Claim Balance Section */}
        <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-purple-200 mb-4 flex items-center gap-2">
            <RiInformationLine className="text-purple-300" /> Claim Your Balance
          </h2>
          <p className="mb-4 text-purple-100">Click the button below to claim your currently vested and claimable ETH.</p>
          <button
            onClick={handleClaimBalance}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
            disabled={!account || !isConnected || isClaimingBalance || isClaimBalanceConfirming || !!networkMessage}
          >
            {(isClaimingBalance || isClaimBalanceConfirming) ? <CgSpinner className="animate-spin inline-block mr-2" /> : ''}
            {(isClaimingBalance || isClaimBalanceConfirming) ? 'Claiming...' : 'Claim My ETH'}
          </button>
        </div>
      </div>
    </div>
  );
}


export default VestingDapp;