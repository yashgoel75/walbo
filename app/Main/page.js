"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// import { auth, provider as GoogleProvider, signInWithPopup } from "../firebase";
import useDarkMode from "../darkMode";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import darkModeLogo from "../../public/WalboLogoDarkMode.png";
import metamaskbg from "../../public/matamask-withoutbg.png";
// import google from "../../public/Google.png";
import "./page.css";

import { createWalletClient, custom } from "viem";
import { flare, sepolia } from "viem/chains";

function Main() {
  const [isDark, toggleDarkMode] = useDarkMode();

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

      <div className={`walbo-container`}>
        <div className="main-container">
          <div className="flex flex-col">
            {isDark ? (
              <Image src={darkModeLogo} width={350} alt="Walbo"></Image>
            ) : (
              <Image src={logo} width={350} alt="Walbo" priority></Image>
            )}

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
                      <Image src={metamaskbg} width={35} alt="MetaMask"></Image>
                    </div>
                    <div className={`content`}>Continue with MetaMask</div>
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
