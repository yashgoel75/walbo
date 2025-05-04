"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";

function Dashboard() {
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
        } else {
          console.log("No address found. Redirecting...");
          router.push("/Main");
        }
      } catch (error) {
        console.error("Error accessing wallet:", error);
        router.push("/Main");
      }
    } else {
      console.log("MetaMask not found. Redirecting...");
      router.push("/Main");
    }
  };

  useEffect(() => {
    main();
  }, []);

  return (
    <>
      <div className="Header">
        <Image src={logo} width={200} alt="Walbo" />
          </div>
          
    </>
  );
}

export default Dashboard;
