"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// import { auth, provider as GoogleProvider, signInWithPopup } from "../firebase";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import darkModeLogo from "../../public/WalboLogoDarkMode.png";
import metamask from "../../public/MetaMask.png";
import metamaskbg from "../../public/matamask-withoutbg.png";
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
        const res = await fetch(
          `/api/users/?walletAddress=${encodeURIComponent(address)}`
        );
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
      setmetamaskinstalled(false);
    }
  };

  return (
    <>
      <div className={`walbo-container`}>
        <div className="main-container">
          <div className="flex flex-col">
            <Image src={logo} width={350} alt="Walbo" priority></Image>

            <div className="login">
              <div className="SocialLoginContainer">
                {/* <div className="SocialLogin">
                <div className="Image">
                  <Image src={google} width={70} alt="Google"></Image>
                </div>
                <div className="content" onClick={handleGoogleLogin}>
                  Continue with Google
                </div>
              </div> */}

                {signInWithMetaMask ? (
                  <div className="SocialLogin" onClick={handleMetaMaskLogin}>
                    <div className="Image">
                                              <Image src={metamask} width={35} alt="MetaMask"></Image>

                      
                    </div>
                    <div className={`content`}>
                      Continue with MetaMask
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {metamaskinstalled ? (
                  ""
                ) : (
                  <div className="installMetaMask">
                    Please install MetaMask in your browser!
                  </div>
                )}
                {isConnecting ? (
                  <div className="connecting">Connecting... Please Wait!</div>
                ) : (
                  ""
                )}
                {isConnected ? <div className="connected">Connected!</div> : ""}
                {isRequestRejected ? (
                  <div className="installMetaMask">Request Rejected</div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
