"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleAuthProvider } from "firebase/auth";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import google from "../../public/google.png";
import metamask from "../../public/MetaMask.png";
import "./page.css";

import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

function Main() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/Login");
  };

  const handleSignUp = () => {
    router.push("/SignUp");
  };
    const [metamaskinstalled, setmetamaskinstalled] = useState(true);
    
  const handleMetaMaskLogin = async () => {
    if (typeof window.ethereum !== "undefined") {
      const client = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const [address] = await client.requestAddresses();
      console.log("Connected wallet address:", address);
      setTimeout(function () {
        router.push("/Dashboard")
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
            <ul>
              <li onClick={handleSignUp}>Sign Up</li>
              <li onClick={handleLogin}>Login</li>
            </ul>
            <div className="SocialLoginContainer">
              <div className="SocialLogin">
                <div className="Image">
                  <Image src={google} width={70} alt="Google"></Image>
                </div>

                <div className="content">Continue with Google</div>
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
