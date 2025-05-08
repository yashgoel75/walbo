"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
// import { auth, provider as GoogleProvider, signInWithPopup } from "../firebase";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import metamask from "../../public/MetaMask.png";
// import google from "../../public/Google.png";
import "./page.css";

import { createWalletClient, custom } from "viem";
import { flare, sepolia } from "viem/chains";

function Main() {
  const router = useRouter();
  const [metamaskinstalled, setmetamaskinstalled] = useState(true);
  const [isConnecting, setisConnecting] = useState(false);
  const [isConnected, setisConnected] = useState(false);
  const [isRequestRejected, setisRequestRejected] = useState(false);
  const [isNewUser, setisNewUser] = useState(false);
  const [signInWithMetaMask, setsignInWithMetaMask] = useState(true);

  // const handleGoogleLogin = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, GoogleProvider);
  //     const user = result.user;
  //     console.log("User:", result.user);
  //     const query = `?uid=${user.uid}&name=${encodeURIComponent(
  //       user.displayName
  //     )}`;
  //     router.push(`/Dashboard${query}`);
  //   } catch (error) {
  //     console.error("Google Sign-In Error:", error);
  //   }
  // };
  const handleMetaMaskLogin = async () => {
    if (typeof window.ethereum !== "undefined") {
      const client = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });
  
      try {
        setisRequestRejected(false);
        setisConnecting(true);
        const [address] = await client.requestAddresses();
        console.log("Connected wallet address:", address);
        setisConnecting(false);
        setisConnected(true);
  
        // Check if wallet address is already registered
        const res = await fetch(`/api/users/?walletAddress=${encodeURIComponent(address)}`);
        const data = await res.json();
  
        if (res.ok && data.exists) {
          router.push(`/Dashboard?wallet=${address}`);
        } else {
          router.push(`/CreateNewAccount?wallet=${address}`);
        }
  
      } catch (err) {
        setisConnecting(false);
        setisRequestRejected(true);
        setTimeout(() => setisRequestRejected(false), 1000);
        console.error("User rejected MetaMask connection:", err);
      }
    } else {
      metamaskinstalled(false);
    }
  };
  

  return (
    <>
      <div className="main-container">
      <div className="image">
        <Image src={logo} alt="Walbo" priority className="logo" />
      </div>
      <div className="login">
        <div className="social-login-container">
          <div
            className="social-login"
            onClick={handleMetaMaskLogin}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleMetaMaskLogin()}
          >
            <div className="social-login-image">
              <Image src={metamask} alt="MetaMask" className="social-icon" />
            </div>
            <div className="social-login-content">Continue with MetaMask</div>
          </div>
          {!metamaskinstalled && (
            <div className="error-message">Please install MetaMask in your browser!</div>
          )}
          {isConnecting && <div className="status-message connecting">Connecting... Please Wait!</div>}
          {isConnected && <div className="status-message connected">Connected!</div>}
          {isRequestRejected && <div className="error-message">Request Rejected</div>}
        </div>
      </div>
    </div>
    </>
  );
}

export default Main;
