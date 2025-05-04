"use client";

import { useRouter } from "next/navigation";
import { GoogleAuthProvider } from "firebase/auth";

import Image from "next/image";
import logo from "../public/WalboLogo.png";
import google from "../public/google.png";
import metamask from "../public/MetaMask.png";
import "./Main.css";

function Main() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/Login");
  };

  const handleSignUp = () => {
    router.push("/SignUp");
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
                <div className="content">Continue with MetaMask</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
