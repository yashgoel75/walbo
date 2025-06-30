"use client";
import { randomUUID } from "crypto";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import logo from "../../public/WalboLogo.png";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import { useState, useEffect } from "react";
export default function Authorize() {
  const [address, setAddress] = useState("");
  const main = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const client = createWalletClient({
          chain: sepolia,
          transport: custom(window.ethereum),
        });

        const [address] = await client.getAddresses();
        if (address) {
          console.log("Wallet connected:", address);
          setAddress(address);
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
  const router = useRouter();
  const params = useSearchParams();
  const client = params.get("client") || "Aurika";

  const handleCancel = () => {
    window.close();
  };

  const handleAllow = async () => {
  const state = params.get("state") || "";
  const code = crypto.randomUUID(); // ✅ FIXED here

  console.log("🔐 Generated code:", code);
  console.log("🔐 Wallet address:", address);

  await fetch("/api/store-auth-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, address }),
  });

  window.opener.postMessage({ code, state }, "http://localhost:3000");
  window.close();
};




  return (
    <div className="authorize-container h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w w-full h-full my-2 shadow-lg rounded-lg shadow-sm p-6">
        <div className="flex mb-4 ">
          <Image src={logo} alt="Walbo Logo" width={150} />
        </div>
        <div className=" mb-2 pl-2 h-6/10 overflow-wrap">
          <h1 className="authorize-container text-xl font-medium text-gray-800 mb-4">
            <strong>{client}</strong> wants to access your Walbo account
          </h1>

          <p className="text-lg text-gray-900 mb-2 font-[inter]">
            This will allow <strong>{client}</strong> to access:
          </p>

          <ul className="text-lg text-gray-800 font-[inter] list-disc pl-6">
            <li>
              Your wallet address:{" "}
              <span className="text-lg">
                <strong>{address}</strong>
              </span>
            </li>
            <li>Your contact list</li>
          </ul>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-lg text-gray-800 bg-white rounded hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAllow}
            className="px-4 py-2 text-lg text-white bg-yellow-600 rounded hover:bg-yellow-500 cursor-pointer"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
