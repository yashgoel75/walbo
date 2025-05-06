"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [address, setaddress] = useState(undefined);

  const router = useRouter();
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
  }
  const handleContactButton = () => {
    router.push(`/ContactList`);
  };
  return (
    <>
      <div className="DashboardHeader">
        <div>
          <Image src={logo} width={200} alt="Walbo" priority />
        </div>

        <div className="nav">
          <ul>
            <li onClick={handleHomeButton}>HOME</li>
            <li onClick={handleContactButton}>CONTACTS</li>
            <li>MY ACCOUNT</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Account;
