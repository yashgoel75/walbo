# Walbo – Decentralized Payments, Simplified Like UPI

**Walbo** is a Web3 payment platform that replaces long and complex wallet addresses with simple, human-readable Walbo IDs. Inspired by the ease of UPI, Walbo aims to make decentralized payments seamless, intuitive, and secure.


## Features
- Custom Walbo ID creation (choose your own handle like `@yashgoel75`)
- Send payments via Walbo ID, contact list, or public key
- Real-time Walbo ID verification before sending
- Smart contact management (add, edit, delete)
- View your full transaction history, including both sent and received payments (if the receiver uses Walbo)
- Easily search through your past transactions with smart filtering tools.
- Enjoy a comfortable viewing experience with built-in dark mode support.
- ETH wallet balance display
- One-click MetaMask login
- Auto logout when MetaMask is disconnected
- Currently supports Ethereum Sepolia Testnet


## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Bootstrap
- **Blockchain Integration:** Viem, MetaMask (Ethereum Sepolia Testnet)
- **Backend:** MongoDB
- **Wallet Connection:** MetaMask

## Project Structure
```
/app        ->  Next.js routes (Home, Pay, Contacts, etc.)
/app/api    ->  route.js (for MongoDB `GET`, `POST`, `PATCH` and `DELETE` API requests)
/libs       ->  MongoDB Connection
/models     ->  MongoDB Schema
/public     ->  Static assets
.env        ->  Environment variables (local setup)
```

## Installation & Setup

1. **Clone the repository**
```
git clone https://github.com/yashgoel75/walbo.git
cd walbo
```

2. **Install dependencies**
```
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory and add your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/walbo
# or use your MongoDB Atlas URI
```

4. **Run the development server**
```
npm run dev
```
The application will be available at [`http://localhost:3000`](http://localhost:3000)