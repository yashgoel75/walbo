"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";

function Dashboard() {
  const [address, setaddress] = useState(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const uid = searchParams.get("uid");
  const query = `?uid=${uid}&name=${name}`;
  console.log({ name, uid });
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
        } else if (typeof uid != "undefined") {
          console.log("Hello, Google Account connected:", uid);
        } else {
          console.log("No address found. Redirecting...");
          router.push("/Main");
        }
      } catch (error) {
        console.error("Error accessing wallet:", error);
        router.push("/Main");
      }
    } else if (typeof uid != "undefined") {
      console.log("Hello, Google Account connected:", uid);
    } else {
      console.log("MetaMask not found. Redirecting...");
      router.push("/Main");
    }
  };

  useEffect(() => {
    main();
  }, []);

  const handleContactButton = () => {
    router.push(`/ContactList${query}`);
  }
  return (
    <>
      <div className="Header">
        <Image src={logo} width={200} alt="Walbo" />
        <div className="nav">
          <ul>
            <li>HOME</li>
            <li onClick={handleContactButton}>CONTACTS</li>
            <li>MY ACCOUNT</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
