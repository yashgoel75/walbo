"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

function Account() {
  const [address, setaddress] = useState("");
  const [balance, setBalance] = useState();
  const [walboId, setWalboId] = useState("");
  const [isAvailable, setisAvailable] = useState(false);
  const [isAvailableIsVisible, setisAvailableIsVisible] = useState(false);
  const router = useRouter();

  const checkAvailability = async () => {
    if (!walboId.trim()) return;
    try {
      const res = await fetch(`/api/users?walboId=${encodeURIComponent(walboId)}`);
      const data = await res.json();
      setisAvailable(!data.exists);
      setisAvailableIsVisible(true);
    } catch (err) {
      console.error("Error checking walboId:", err);
      setisAvailable(false);
      setisAvailableIsVisible(true);
    }
  };

  const handleAccountCreation = async () => {
    if (!isAvailable || !address || !walboId) return;
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walboId, walletAddress: address }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully!");
        router.push("/Dashboard");
      } else {
        alert(data.message || "Account creation failed");
      }
    } catch (err) {
      console.error("Account creation error:", err);
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

        const [addr] = await client.getAddresses();
        if (addr) {
          setaddress(addr);
          await getBalance(addr);
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

  return (
    <>
      <div className="main-container">
        <div className="main-container-heading">
          <Image src={logo} width={200} alt="Walbo" />
        </div>
        <div className="createNewUserContainer">
          <div className="createNewUserHeading">Create a Walbo Account</div>
          <br />
          <div className="createNewUserContent">
            <div className="inputPublicKey">
              <label htmlFor="publicKey">Your Wallet Address</label>
              <input
                disabled
                className="focus:outline-1 disabled:bg-gray-100 disabled:border-gray-200"
                id="walletAddress"
                name="walletAddress"
                value={address}
              />
            </div>
            <br />
            <label htmlFor="WalboId">Enter a Walbo ID:</label>
            <div className="walboIdInput">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="fit-content"
                viewBox="0 -960 960 960"
                width="40px"
                fill="#000000"
              >
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v54.67q0 57-39.73 96.5t-97.6 39.5q-35.72 0-67.36-16.67t-49.98-47.33q-27 32.33-65.22 48.16-38.22 15.84-80.11 15.84-79.4 0-135.37-55.5-55.96-55.5-55.96-135.18t55.96-135.83Q400.6-672 480-672t135.37 56.16q55.96 56.16 55.96 135.84v54.67q0 29.07 20.67 49.2Q712.67-356 742.33-356q29.67 0 50.34-20.13 20.66-20.13 20.66-49.2V-480q0-139.58-96.87-236.46-96.88-96.87-236.46-96.87t-236.46 96.87Q146.67-619.58 146.67-480t96.87 236.46q96.88 96.87 236.46 96.87h209.33V-80H480Zm.04-276q51.96 0 88.29-36.17 36.34-36.16 36.34-87.83 0-52.67-36.38-89-36.37-36.33-88.33-36.33T391.67-569q-36.34 36.33-36.34 89 0 51.67 36.38 87.83Q428.08-356 480.04-356Z" />
              </svg>
              <input
                className="focus:outline-1"
                name="walboId"
                id="walboId"
                value={walboId}
                onChange={(e) => setWalboId(e.target.value)}
              />
              <button onClick={checkAvailability}>Check Availability</button>
            </div>

            {isAvailableIsVisible &&
              (isAvailable ? (
                <div className="connected">Available!</div>
              ) : (
                <div className="installMetaMask">Walbo ID already taken</div>
              ))}
          </div>

          <button
            id={isAvailable ? "createAccount" : "disabledCreateAccount"}
            disabled={!isAvailable}
            onClick={handleAccountCreation}
          >
            Create Account
          </button>
        </div>
      </div>
    </>
  );
}

export default Account;
