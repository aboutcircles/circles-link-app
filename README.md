# Circles Link Registry

A React application that allows users to link their external Ethereum addresses to Circles accounts and join the Proof of Humanity (PoH) Circles Group.

## 🌟 Features

- **Multi-Wallet Support**: Connect with MetaMask, Rabby, or other injected wallets
- **Account Linking**: Link external addresses to Circles accounts
- **PoH Integration**: Join the PoH Circles Group if you have a verified PoH ID
- **Bidirectional Links**: View and manage bidirectional connections between accounts
- **Real-time Status**: Check PoH verification and group membership status

## 🔧 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aboutcircles/circles-link-app.git
cd circles-link-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Deployment

To deploy to GitHub Pages:

```bash
npm run deploy
```

## 🏗️ Architecture

### Key Contracts

- **Linking Contract**: `0x3DE001984A546a90d05375f968a05ac39B2D52E9`
- **PoH Membership Contract**: `0x32cB147E4C529DFFdB837f60f0118f2002401FCA`
- **Group Service**: `0xb5a7b74103AF9D6924B9f15Ab071aC48801E9B41`
- **Circles Hub V2**: `0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8`

## 📱 Usage

### Connecting Your Wallet

1. Select your preferred wallet (MetaMask, Rabby, etc.)
2. Connect to Gnosis Chain (will prompt if on wrong network)
3. Approve the connection

### Linking Accounts

#### Direct On-Chain Link
1. Go to the "Link" tab
2. Enter the target account address
3. Click "Create Link" to submit transaction
4. Confirm the transaction in your wallet

#### Account Types
- **Circles Account**: A registered Circles user account
- **External Account**: Any Gnosischain address (wallet, EOA, etc.)
- At least one account in the link must be a Circles account

### Joining PoH Group

To join the PoH Circles Group, you need:
1. A Circles account (you)
2. A bidirectional link with a PoH-verified account
3. Click "🌟 Join PoH Group" when eligible

## 🔐 Smart Contract Integration

### Linking Contract Functions
```solidity
function link(address _to) external
function isCirclesAccount(address _account) external view returns (bool)
function isLinkEstablished(address circlesAccount, address externalAccount) external view returns (bool)
function getLinkedExternalAccounts(address circlesAccount) external view returns (address[])
```

### PoH Integration
```solidity
function hasValidPoHId(address account) external view returns (bool)
function getPoHIdByOwner(address _account) external view returns (bytes20 pohId)
function register(bytes20 humanityID, address _account) external
```

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always verify contract addresses and transactions before confirming.
