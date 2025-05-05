"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, provider as GoogleProvider, signInWithPopup } from "../firebase";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import metamask from "../../public/MetaMask.png";
import google from "../../public/Google.png";
import "./page.css";

import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

function Main() {
  const router = useRouter();
  const [metamaskinstalled, setmetamaskinstalled] = useState(true);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, GoogleProvider);
      const user = result.user;
      console.log("User:", result.user);
      const query = `?uid=${user.uid}&name=${encodeURIComponent(
        user.displayName
      )}`;
      router.push(`/Dashboard${query}`);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };
  const handleMetaMaskLogin = async () => {
    if (typeof window.ethereum !== "undefined") {
      const client = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const [address] = await client.requestAddresses();
      console.log("Connected wallet address:", address);
      setTimeout(function () {
        router.push("/Dashboard");
      }, 1000);
    } else {
      setmetamaskinstalled(false);
    }
  };

  return (
    <>
      <div className="main-container">
        <div className="flex flex-col">
          <div className="image">
            <Image src={logo} width={400} alt="Walbo"></Image>
          </div>
          <div className="login">
            <div className="SocialLoginContainer">
              <div className="SocialLogin">
                <div className="Image">
                  <Image src={google} width={70} alt="Google"></Image>
                </div>
                <div className="content" onClick={handleGoogleLogin}>
                  Continue with Google
                </div>
              </div>
              <div className="SocialLogin">
                <div className="Image">
                  <Image src={metamask} width={35} alt="MetaMask"></Image>
                </div>
                <div className="content" onClick={handleMetaMaskLogin}>
                  Continue with MetaMask
                </div>
              </div>
              {metamaskinstalled ? (
                ""
              ) : (
                <div className="installMetaMask">
                  Please install MetaMask in your browser!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
