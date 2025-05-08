"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  formatEther,
} from "viem";

import { sepolia } from "viem/chains";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";

// ... (your imports and top part remain unchanged)

function TransactionHistory() {
    const [address, setaddress] = useState(undefined);
    const [walboId, setWalboId] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [ContactCount, setContactCount] = useState(0);
    const [balance, setBalance] = useState();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    const router = useRouter();
  
    const fetchWalboIdAndContacts = async () => {
      try {
        const res = await fetch(
          `/api/users?walletAddress=${encodeURIComponent(address)}`
        );
        const data = await res.json();
  
        if (data.exists) {
          setWalboId(data.walboId);
          setContactCount(data.contacts.length);
          setTransactions(data.transactions || []); // 👈 set transaction history
        } else {
          alert("No Walbo account found. Please create an account.");
          router.push("/create-user");
        }
      } catch (err) {
        console.error("Error fetching contacts or transactions:", err);
        alert("Failed to load data. Please try again.");
        router.push("/Main");
      }
    };
  
    const getBalance = async (address) => {
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });
  
      const balance = await publicClient.getBalance({ address });
      const formatted = parseFloat(formatEther(balance)).toFixed(4);
      setBalance(formatted);
    };
  
    const main = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const client = createWalletClient({
            chain: sepolia,
            transport: custom(window.ethereum),
          });
  
          const [address] = await client.getAddresses();
  
          if (address) {
            setaddress(address);
            await getBalance(address);
          } else {
            router.push("/Main");
          }
        } catch (error) {
          console.error("Error accessing wallet:", error);
          router.push("/Main");
        }
      } else {
        router.push("/Main");
      }
    };
  
    useEffect(() => {
      if (address) {
        fetchWalboIdAndContacts();
      }
    }, [address]);
  
    useEffect(() => {
      main();
    }, []);
  
    useEffect(() => {
      if (!window.ethereum) return;
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          router.push("/Main");
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }, []);
  
    const handleHomeButton = () => {
      router.push(`/Dashboard`);
    };
  
    const handleContactButton = () => {
      router.push(`/ContactList`);
    };
  
    return (
      <>
        <div className="DashboardHeader">
          <div className="logo">
            <Image src={logo} alt="Walbo" priority />
          </div>
          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <div className={`nav ${isMenuOpen ? "active" : ""}`}>
            <ul>
              <li onClick={() => { handleHomeButton(); setIsMenuOpen(false); }}>Home</li>
              <li onClick={() => { handleContactButton(); setIsMenuOpen(false); }}>Contacts</li>
              <li onClick={() => { setIsMenuOpen(false); }}>Account</li>
            </ul>
          </div>
        </div>
  
        <br />
        <div className="heading container">Transaction History</div>
        <br />
  
        <div className="container">
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>To</th>
                  <th>Amount (ETH)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr key={txn._id}>
                    <td>{index + 1}</td>
                    <td>{txn.to}</td>
                    <td>{txn.amount}</td>
                    <td>{new Date(txn.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }
  
  export default TransactionHistory;
  