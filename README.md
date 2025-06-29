# Vesting Application
This project implements a Cliff-based Vesting Application, designed to manage the gradual release of digital tokens to stakeholders over a predetermined period. It ensures transparency and automation by leveraging smart contracts on the blockchain.

# Features
Cliff Vesting Schedule: Tokens are locked for an initial "cliff period," after which a lump sum is released, followed by a regular vesting schedule.

Blockchain Integration: Built on modern Ethereum development tools for secure and transparent token management.

Wallet Connection: Seamless integration with various cryptocurrency wallets for user interaction.

# Technologies Used
Frontend:

Next.js: A React framework for building fast, server-rendered React applications.

wagmi: A collection of React Hooks for Ethereum that makes it easy to interact with smart contracts, wallets, and more.

viem: A lightweight, type-safe, and performant TypeScript interface for Ethereum that provides low-level control for interacting with the blockchain.

RainbowKit: A beautiful and easy-to-use wallet connection library for dApps.

Tailwind CSS: A utility-first CSS framework for rapidly building custom designs.

Smart Contracts:

Solidity: The primary language for writing Ethereum smart contracts.

Foundry: A blazing fast, portable and modular toolkit for Ethereum application development, used for smart contract development, testing, and deployment.

Anvil: A local testnet node, part of the Foundry suite, for fast and reliable development and testing of smart contracts.

# Prerequisites
Before you begin, ensure you have the following installed:

Node.js: Download & Install Node.js (which includes npm).

pnpm: A fast, disk space efficient package manager.

Foundry: Follow the instructions on the Foundry Book to install forge and anvil.
```
curl -L https://foundry.paradigm.xyz | bash
foundryup
```
⚙️ Getting Started
Follow these steps to get the Vesting Application running on your local machine:

1. Clone the Repository
```
git clone https://github.com/Pratyushdube/VestingDapp.git
cd vesting-application # or the name of your cloned directory
```

2. Initialize pnpm
This step ensures pnpm is set up in the root of your project if you haven't done so.
```
pnpm init
```

3. Smart Contract Setup and Deployment
Navigate to the contracts directory, initialize Foundry, build your contracts, start Anvil, and deploy your contract.

### Initialize Foundry in the contracts directory (if not already done)
forge init contracts

# Build the smart contracts
forge build

# Open a NEW TERMINAL and start the local Anvil blockchain
# Keep this terminal running in the background for the duration of development
pnpm anvil

# In your ORIGINAL TERMINAL (still in the 'contracts' directory), deploy your contract
# Make sure Anvil is running on http://127.0.0.1:8545 before executing this command

forge create src/Counter.sol:Counter --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# Note: Replace 'src/Counter.sol:Counter' with your actual Vesting contract path and name,

4. Frontend Setup and Run
Navigate back to the project root, set up the frontend, and start the development server.

# Navigate back to the project root
cd ..

# Create the React frontend using Vite (if not already created)
pnpm create vite frontend --template react

# Navigate into the frontend directory
cd frontend

# Install frontend dependencies
pnpm install

# Add viem as a dependency (if not already included by create-vite or wagmi)
pnpm add viem

# Start the frontend development server
pnpm run dev

Open http://localhost:3000 in your browser to view the application. The page will hot-reload as you make edits to the frontend files.
