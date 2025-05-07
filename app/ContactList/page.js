"use client";

import mongoose, { Schema, model } from "mongoose";

import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";
import { useRouter, useSearchParams } from "next/navigation";

import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

function ContactList() {
  //  const searchParams = useSearchParams();

  //    const name = searchParams.get("name");
  //    const uid = searchParams.get("uid");
  const router = useRouter();
  const [address, setaddress] = useState("");
  const [addContactForm, setaddContactForm] = useState(false);
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

  const handleAddContact = () => {
    // setaddContactForm(true);
    router.push("/CreateNewContact");
  };
  const handleCloseAddContactForm = () => {
    setaddContactForm(false);
  };
  const handleSearch = () => {};
  const handleSave = () => {};
  useEffect(() => {
    main();
  }, []);
  const handleHomeButton = () => {
    router.push(`/Dashboard`);
  }
const handleContactButton = () => {
    router.push(`/ContactList`);
  };
  const handleAccountButton = () => {
    router.push(`/Account`);
  };
  return (
    <>
      {addContactForm ? (
        <div className="addContactFormContainer">
          <div className="addContactForm">
            <div className="contactFormHeader">
              <div className="closeButton">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="40px"
                  viewBox="0 -960 960 960"
                  width="40px"
                  fill="#000000"
                  onClick={handleCloseAddContactForm}
                >
                  <path d="m251.33-204.67-46.66-46.66L433.33-480 204.67-708.67l46.66-46.66L480-526.67l228.67-228.66 46.66 46.66L526.67-480l228.66 228.67-46.66 46.66L480-433.33 251.33-204.67Z" />
                </svg>
              </div>
              <div className="ContactFormHeading">Add New Contact</div>
            </div>
            <div className="ContactFormForm">
              <label htmlFor="name">Enter the Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Alice"
              ></input>
              <label htmlFor="publicKey">Enter the Public Key:</label>
              <input
                type="text"
                id="publicKey"
                name="publicKey"
                placeholder="0x..."
              ></input>
              <button id="saveContact" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      <div className="DashboardHeader">
              <div>
                <Image src={logo} width={200} alt="Walbo" priority />
              </div>
      
              <div className="nav">
                <ul>
                  <li onClick={handleHomeButton}>HOME</li>
                  <li onClick={handleContactButton}>CONTACTS</li>
                  <li onClick={handleAccountButton}>MY ACCOUNT</li>
                </ul>
              </div>
      </div>
      

      <div className="heading">Contacts</div>
      <div className="addContactContainer">
        <div className="searchContact" onClick={handleSearch}>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Seach a Contact"
          ></input>
        </div>
        <div className="addContact" onClick={handleAddContact}>
          Add Contact
        </div>
      </div>
    </>
  );
}

export default ContactList;
