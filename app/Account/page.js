"use client";
import useDarkMode from "../darkMode";
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
import darkModeLogo from "../../public/WalboLogoDarkMode.png";

import "./page.css";

function Account() {
  const [isDark, toggleDarkMode] = useDarkMode();
  const [address, setaddress] = useState(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ContactCount, setContactCount] = useState(0);
  const [walboId, setWalboId] = useState("");
  const [isVisible, setIsVisible] = useState(false);

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
      } else {
        alert("No Walbo account found. Please create an account.");
        router.push("/create-user");
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      alert("Failed to load contacts. Please try again.");
      router.push("/Main");
    }
  };
  useEffect(() => {
    if (address) {
      fetchWalboIdAndContacts();
    }
  }, [address]);
  const main = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const client = createWalletClient({
          chain: sepolia,
          transport: custom(window.ethereum),
        });

        const [address] = await client.getAddresses();

        if (typeof address !== "undefined") {
          console.log("Hello, wallet connected:", address);
          setaddress(address);
          await getBalance(address);
        }
        // else if (typeof uid != "undefined") {
        //   console.log("Hello, Google Account connected:", uid);
        // }
        else {
          console.log("No address found. Redirecting...");
          router.push("/Main");
        }
      } catch (error) {
        console.error("Error accessing wallet:", error);
        router.push("/Main");
      }
    }
    // else if (typeof uid != "undefined") {
    //   console.log("Hello, Google Account connected:", uid);
    // }
    else {
      console.log("MetaMask not found. Redirecting...");
      router.push("/Main");
    }
  };
  function transactionHistory() {
    router.push("/TransactionHistory");
  }
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

  const [balance, setBalance] = useState();

  const getBalance = async (address) => {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });

    const balance = await publicClient.getBalance({ address });
    const formatted = parseFloat(formatEther(balance)).toFixed(4);
    console.log(`ETH Balance: ${parseFloat(formatted).toFixed(4)}`);
    setBalance(formatted);
  };

  useEffect(() => {
    main();
  }, []);
  const handleHomeButton = () => {
    router.push(`/Dashboard`);
  };
  const handleContactButton = () => {
    router.push(`/ContactList`);
  };
  return (
    <>
      <div className="darkModeToggle">
        {isDark ? (
          <svg
            onClick={toggleDarkMode}
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#ffffff"
          >
            <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z" />
          </svg>
        ) : (
          <svg
            onClick={toggleDarkMode}
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#000000"
          >
            <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
          </svg>
        )}
      </div>
      <div className={`DashboardHeader${isDark ? "-dark" : ""}`}>
        <div className="logo">
          {isDark ? (
            <Image src={darkModeLogo} width={350} alt="Walbo"></Image>
          ) : (
            <Image src={logo} width={350} alt="Walbo" priority></Image>
          )}
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
            <li
              onClick={() => {
                handleHomeButton();
                setIsMenuOpen(false);
              }}
            >
              Home
            </li>
            <li
              onClick={() => {
                handleContactButton();
                setIsMenuOpen(false);
              }}
            >
              Contacts
            </li>
            <li
              onClick={() => {
                setIsMenuOpen(false);
              }}
            >
              Account
            </li>
          </ul>
        </div>
      </div>
      <br></br>
      <div className="heading container">My Account</div>

      <div className="container">
        <hr />
        <div className="accountName">
          <div className="getBalance">Your Current Balance:</div>
          {isVisible ? (
            <div className="balance">
              {balance ? `${balance} SepoliaETH` : "Loading..."}
            </div>
          ) : (
            <div className="getBalance">••••••</div>
          )}
          {isVisible ? (
            <div className="getBalance" onClick={() => setIsVisible(false)}>
              {isDark ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#ffffff"
                >
                  <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                </svg>
              )}
            </div>
          ) : (
            <div
              className="getBalance"
              onClick={() => {
                setIsVisible(true);
                if (address) getBalance(address);
              }}
            >
              {isDark ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#ffffff"
                >
                  <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                </svg>
              )}
            </div>
          )}
        </div>
        <hr />
        <div className="accountName">
          <div className="getBalance">Walbo ID:</div>
          <div className="balance">{walboId || "Loading..."}</div>
        </div>
        <div className="accountName">
          <div className="getBalance">Wallet Address:</div>
          <div className="balance">{address || "Loading..."}</div>
        </div>
        <div className="accountName">
          <div className="getBalance">Contacts:</div>
          <div className="balance">{ContactCount || 0}</div>
        </div>
        <hr />
        <div className="accountName">
          <div className="getBalance">Transaction History:</div>
          <div className="balance">
            <div
              className={`transactionHistoryButton${isDark ? "-dark" : ""}`}
              onClick={transactionHistory}
            >
              Go to Transaction History
            </div>
          </div>
        </div>
      </div>
      <br></br>
    </>
  );
}

export default Account;
