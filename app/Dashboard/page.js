"use client";

import "bootstrap/dist/css/bootstrap.min.css";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";

import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  formatEther,
} from "viem";
import { sepolia } from "viem/chains";
import { waitForTransactionReceipt } from "viem/actions";

function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [address, setAddress] = useState(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const [isWalboIdPayment, setIsWalboIdPayment] = useState(true);
  const [isContactsPayment, setIsContactsPayment] = useState(false);
  const [isPublicPayment, setIsPublicPayment] = useState(false);
  const [isPublicPaymentFailed, setIsPublicPaymentFailed] = useState(false);
  const [isPublicTransactionPending, setIsPublicTransactionPending] =
    useState(false);
  const [isPublicTransactionSuccess, setIsPublicTransactionSuccess] =
    useState(false);
  const [walboId, setWalboId] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [contactWalboId, setContactWalboId] = useState("");
  const [contactWalletAddress, setContactWalletAddress] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAvailableIsVisible, setIsAvailableIsVisible] = useState(false);
  const [isRequestRejected, setIsRequestRejected] = useState(false);

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
          setAddress(address);
          await getBalance(address);
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

  const getBalance = async (address) => {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });

    const balance = await publicClient.getBalance({ address });
    const formatted = parseFloat(formatEther(balance)).toFixed(4);
    console.log(`ETH Balance: ${formatted}`);
    setBalance(formatted);
  };

  const fetchWalboIdAndContacts = async () => {
    try {
      const res = await fetch(
        `/api/users?walletAddress=${encodeURIComponent(address)}`
      );
      const data = await res.json();
      if (data.exists) {
        setWalboId(data.walboId);
        setContacts(data.contacts || []);
      } else {
        alert("No Walbo account found. Please create an account.");
        router.push("/create-user");
      }
    } catch (err) {
      console.error("Error fetching walboId:", err);
      alert("Failed to load account details. Please try again.");
      router.push("/Main");
    }
  };

  useEffect(() => {
    if (address) {
      fetchWalboIdAndContacts();
    }
  }, [address]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        router.push("/Main");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  useEffect(() => {
    main();
  }, []);

  const handleContactButton = () => {
    router.push(`/ContactList`);
  };

  const handleAccountButton = () => {
    router.push(`/Account`);
  };

  const handleAddressChange = (e) => {
    setReceiverAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleContactSelect = (e) => {
    const contactName = e.target.value;
    setSelectedContact(contactName);
    const contact = contacts.find((c) => c.name === contactName);
    setReceiverAddress(contact ? contact.publicKey : "");
  };

  const getDetails = async () => {
    if (!contactWalboId.trim()) {
      alert("Please enter a Walbo ID to verify.");
      return;
    }
    try {
      const res = await fetch(
        `/api/users?walboId=${encodeURIComponent(contactWalboId)}`
      );
      const data = await res.json();
      if (data.exists) {
        setContactWalletAddress(data.walletAddress);
        setReceiverAddress(data.walletAddress);
        setIsAvailable(false);
      } else {
        setContactWalletAddress("");
        setReceiverAddress("");
        setIsAvailable(true);
      }
      setIsAvailableIsVisible(true);
    } catch (err) {
      console.error("Error checking walboId:", err);
      setContactWalletAddress("");
      setReceiverAddress("");
      setIsAvailable(true);
      setIsAvailableIsVisible(true);
      alert("Error verifying Walbo ID. Please try again.");
    }
  };

  const [toWalboId, setToWalboId] = useState("");
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [remark, setRemark] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const handleSendTransaction = async () => {
    setIsPublicTransactionSuccess(false);
    setIsRequestRejected(false);

    const client = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });

    const [address] = await client.getAddresses();

    let receiverWalboId = "";
    let receiverName = "";
    let receiverExists = false;

    try {
      // Fetch sender data
      const resSender = await fetch(
        `/api/users?walletAddress=${encodeURIComponent(address)}`
      );
      if (!resSender.ok) throw new Error("Failed to fetch sender data");
      const data = await resSender.json();

      // Fetch receiver data
      const resReceiver = await fetch(
        `/api/users?walletAddress=${encodeURIComponent(receiverAddress)}`
      );
      if (resReceiver.ok) {
        const dataReceiver = await resReceiver.json();
        receiverWalboId = dataReceiver.walboId || "";
        receiverExists = dataReceiver.exists || false;
        setToWalboId(receiverWalboId);
      }

      if (data.exists) {
        const matchingContact = data.contacts.find(
          (contact) => contact.publicKey === receiverAddress
        );
        if (matchingContact) {
          receiverName = matchingContact.name;
          setToName(receiverName);
        }
      } else {
        alert("No Walbo account found. Please create an account.");
        return;
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      return;
    }

    try {
      if (!receiverAddress || !/^(0x)?[0-9a-fA-F]{40}$/.test(receiverAddress)) {
        alert("Please enter a valid Ethereum address.");
        return;
      }
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
      }
      if (balance && parseFloat(amount) > parseFloat(balance)) {
        alert("Insufficient balance for this transaction.");
        return;
      }

      const hash = await client.sendTransaction({
        account: address,
        to: receiverAddress,
        value: parseEther(amount),
      });
      setIsPublicTransactionPending(true);
      setTransactionHash(hash);

      const receipt = await waitForTransactionReceipt(client, { hash });
      if (receipt) {
        setIsPublicTransactionPending(false);
        setIsPublicTransactionSuccess(true);
        setAmount("");
        setReceiverAddress("");

        // Update sender transaction history
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walboId,
            transactionHistory: {
              type: "1",
              fromWalboId: walboId,
              toWalboId: receiverWalboId,
              fromName: "Me",
              toName: receiverName,
              fromPublicKey: address,
              toPublicKey: receiverAddress,
              amount,
              remark,
              status: "Success",
              transactionHash: hash,
            },
          }),
        });
        if (!res.ok)
          throw new Error("Failed to update sender transaction history");
        const data = await res.json();
        console.log(data.message);

        // Update receiver transaction history
        if (receiverExists) {
          const resReceiver = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walboId: receiverWalboId,
              transactionHistory: {
                type: "0",
                fromWalboId: walboId,
                toWalboId: receiverWalboId,
                fromName: walboId,
                toName: "Me",
                fromPublicKey: address,
                toPublicKey: receiverAddress,
                amount,
                remark,
                status: "Success",
                transactionHash: hash,
              },
            }),
          });
          if (!resReceiver.ok)
            throw new Error("Failed to update receiver transaction history");
        }

        await getBalance(address);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walboId,
          transactionHistory: {
            type: "1",
            fromWalboId: walboId,
            toWalboId: receiverWalboId,
            fromName: "Me",
            toName: receiverName,
            fromPublicKey: address,
            toPublicKey: receiverAddress,
            amount,
            remark,
            status: "Failed",
          },
        }),
      });
      setIsRequestRejected(true);
      setTimeout(() => setIsRequestRejected(false), 3000);
    }
  };
  return (
    <>
      <div className={`walbo-container`}>
        <div className="DashboardHeader">
          <div className="logo">
            <Image src={logo} alt="Walbo" priority />
          </div>
          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <div className={`nav ${isMenuOpen ? "active" : ""}`}>
            <ul>
              <li onClick={() => setIsMenuOpen(false)}>Home</li>
              <li
                onClick={() => {
                  handleContactButton();
                  setIsMenuOpen(false);
                }}
              >
                Contacts
              </li>
              <li
                onClick={() => {
                  handleAccountButton();
                  setIsMenuOpen(false);
                }}
              >
                Account
              </li>
            </ul>
          </div>
        </div>
        <br></br>

        <div className="AccountRelatedOperations">
          <div className="getBalance">Welcome,</div>
          <div className="balance">{walboId || "Loading..."}</div>
        </div>
        <div className="AccountRelatedOperations">
          <div className="getBalance">Your Current Balance:</div>
          {isVisible ? (
            <div className="balance">
              {balance ? `${balance} SepoliaETH` : "Loading..."}
            </div>
          ) : (
            <div className="getBalance">••••••</div>
          )}
          {isVisible ? (
            <div className="getBalance" onClick={() => setIsVisible(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
              </svg>
            </div>
          ) : (
            <div
              className="getBalance"
              onClick={() => {
                setIsVisible(true);
                if (address) getBalance(address);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
              </svg>
            </div>
          )}
        </div>

        <div className="paymentOptions">
          <div
            className="paymentOption"
            onClick={() => {
              setIsWalboIdPayment(true);
              setIsContactsPayment(false);
              setIsPublicPayment(false);
            }}
          >
            <div className="paymentImage">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="48px"
                viewBox="0 -960 960 960"
                width="48px"
                fill="#000000"
              >
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v53q0 56-39.34 94.5Q801.31-294 744-294q-36.08 0-68.04-17.5Q644-329 627-361q-26 34-65.08 50.5Q522.83-294 480-294q-77.61 0-132.3-54Q293-402 293-480.01q0-78.02 54.7-133Q402.39-668 480-668q77.6 0 132.3 54.99Q667-558.02 667-480v53q0 30.61 22.5 51.81Q712-354 743.5-354t54-21.19Q820-396.39 820-427v-53q0-142.38-98.81-241.19T480-820q-142.37 0-241.19 98.81Q140-622.38 140-480q0 142.37 98.81 241.19Q337.63-140 480-140h214v60H480Zm.06-274Q533-354 570-390.75T607-480q0-54-37.06-91t-90-37Q427-608 390-571t-37 91q0 52.5 37.06 89.25t90 36.75Z" />
              </svg>
            </div>
            <div className="paymentName">Pay Walbo ID</div>
          </div>
          <div
            className="paymentOption"
            onClick={() => {
              setIsContactsPayment(true);
              setIsWalboIdPayment(false);
              setIsPublicPayment(false);
            }}
          >
            <div className="paymentImage">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="60px"
                viewBox="0 -960 960 960"
                width="60px"
                fill="#000000"
              >
                <path d="M0-240v-53q0-38.57 41.5-62.78Q83-380 150.38-380q12.16 0 23.39.5t22.23 2.15q-8 17.35-12 35.17-4 17.81-4 37.18v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-19.86-3.5-37.43T765-377.27q11-1.73 22.17-2.23 11.17-.5 22.83-.5 67.5 0 108.75 23.77T960-293v53H780Zm-480-60h360v-6q0-37-50.5-60.5T480-390q-79 0-129.5 23.5T300-305v5ZM149.57-410q-28.57 0-49.07-20.56Q80-451.13 80-480q0-29 20.56-49.5Q121.13-550 150-550q29 0 49.5 20.5t20.5 49.93q0 28.57-20.5 49.07T149.57-410Zm660 0q-28.57 0-49.07-20.56Q740-451.13 740-480q0-29 20.56-49.5Q781.13-550 810-550q29 0 49.5 20.5t20.5 49.93q0 28.57-20.5 49.07T809.57-410ZM480-480q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm.35-60Q506-540 523-557.35t17-43Q540-626 522.85-643t-42.5-17q-25.35 0-42.85 17.15t-17.5 42.5q0 25.35 17.35 42.85t43 17.5ZM480-300Zm0-300Z" />
              </svg>
            </div>
            <div className="paymentName">Pay Contacts</div>
          </div>
          <div
            className="paymentOption"
            onClick={() => {
              setIsPublicPayment(true);
              setIsWalboIdPayment(false);
              setIsContactsPayment(false);
            }}
          >
            <div className="paymentImage">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="48px"
                viewBox="0 -960 960 960"
                width="48px"
                fill="#000000"
              >
                <path d="M280-412q-28 0-48-20t-20-48q0-28 20-48t48-20q28 0 48 20t20 48q0 28-20 48t-48 20Zm0 172q-100 0-170-70T40-480q0-100 70-170t170-70q72 0 126 34t85 103h356l113 113-167 153-88-64-88 64-75-60h-51q-25 60-78.5 98.5T280-240Zm0-60q58 0 107-38.5t63-98.5h114l54 45 88-63 82 62 85-79-51-51H450q-12-56-60-96.5T280-660q-75 0-127.5 52.5T100-480q0 75 52.5 127.5T280-300Z" />
              </svg>
            </div>
            <div className="paymentName">Pay Public Key</div>
          </div>
          <div
            className="paymentOption"
            onClick={() => {
              router.push("/TransactionHistory");
            }}
          >
            <div className="paymentImage">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="48px"
                viewBox="0 -960 960 960"
                width="48px"
                fill="#000000"
              >
                <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
              </svg>
            </div>
            <div className="paymentName">Transaction History</div>
          </div>
        </div>

        {isWalboIdPayment && (
          <div className="container border mb-4 rounded-3 ps-4 pe-4">
            <div className="h4 mt-2 text-center">Pay to Walbo ID</div>
            {isPublicPaymentFailed && (
              <div className="transactionFailed">Transaction Failed!</div>
            )}
            {isPublicTransactionPending && (
              <div className="transactionPending">
                Transaction Pending... Please Wait!
              </div>
            )}
            {isRequestRejected && (
              <div className="transactionFailed">Request Rejected</div>
            )}
            {isPublicTransactionSuccess && (
              <div className="transactionSuccess">Transaction Successful!</div>
            )}
            <div className="h5">
              <label htmlFor="walboId">
                Enter the Walbo ID of the receiver:
              </label>
              <div className="input-group mb-3 mt-2">
                <span className="input-group-text">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="40px"
                    viewBox="0 -960 960 960"
                    width="25px"
                    fill="#000000"
                  >
                    <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v54.67q0 57-39.73 96.5t-97.6 39.5q-35.72 0-67.36-16.67t-49.98-47.33q-27 32.33-65.22 48.16-38.22 15.84-80.11 15.84-79.4 0-135.37-55.5-55.96-55.5-55.96-135.18t55.96-135.83Q400.6-672 480-672t135.37 56.16q55.96 56.16 55.96 135.84v54.67q0 29.07 20.67 49.2Q712.67-356 742.33-356q29.67 0 50.34-20.13 20.66-20.13 20.66-49.2V-480q0-139.58-96.87-236.46-96.88-96.87-236.46-96.87t-236.46 96.87Q146.67-619.58 146.67-480t96.87 236.46q96.88 96.87 236.46 96.87h209.33V-80H480Zm.04-276q51.96 0 88.29-36.17 36.34-36.16 36.34-87.83 0-52.67-36.38-89-36.37-36.33-88.33-36.33T391.67-569q-36.34 36.33-36.34 89 0 51.67 36.38 87.83Q428.08-356 480.04-356Z" />
                  </svg>
                </span>
                <input
                  className="form-control"
                  name="walboId"
                  placeholder="Enter Walbo ID"
                  value={contactWalboId}
                  onChange={(e) => setContactWalboId(e.target.value)}
                />
                <span className="input-group-text">
                  <button className="button" onClick={getDetails}>
                    Verify
                  </button>
                </span>
              </div>
              {isAvailableIsVisible &&
                (isAvailable ? (
                  <div className="transactionFailed">
                    <svg
                      className="errorMark"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#680101"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    Walbo ID Invalid!{" "}
                  </div>
                ) : (
                  <div className="transactionSuccess">
                    <svg
                      className="verifiedCheckMark"
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#034509"
                    >
                      <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" />
                    </svg>
                    Verified{" "}
                  </div>
                ))}
              <label htmlFor="publicKey">Receiver&lsquo;s Public Key:</label>
              <input
                name="publicKey"
                value={contactWalletAddress}
                disabled
                className="form-control mt-2 focus:outline-1 disabled:bg-gray-100 disabled:border-gray-200"
                placeholder="Wallet address will appear here"
              />
              <br></br>
              <label htmlFor="amount">Enter amount (in Ethers):</label>
              <input
                className="form-control mb-3 mt-2"
                name="amount"
                placeholder="0.01"
                value={amount}
                onChange={handleAmountChange}
              />
              <label htmlFor="remark">Remarks (if any):</label>
              <input
                className="form-control mb-3 mt-2"
                name="remark"
                placeholder="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
              <button
                className="btn btn-warning mb-3"
                onClick={handleSendTransaction}
              >
                Send Transaction
              </button>
            </div>
          </div>
        )}

        {isContactsPayment && (
          <div className="container border mb-4 rounded-3 ps-4 pe-4">
            <div className="h4 mt-2 text-center">Pay to a Contact</div>
            {isPublicPaymentFailed && (
              <div className="transactionFailed">Transaction Failed!</div>
            )}
            {isPublicTransactionPending && (
              <div className="transactionPending">
                Transaction Pending... Please Wait!
              </div>
            )}
            {isPublicTransactionSuccess && (
              <div className="transactionSuccess">Transaction Successful!</div>
            )}
            <div className="h5">
              <label className="selectContact" htmlFor="contact">
                <strong>Select a Contact:</strong>
              </label>
              <select
                id="contact"
                name="contact"
                value={selectedContact}
                onChange={handleContactSelect}
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.publicKey} value={contact.name}>
                    {contact.name}
                  </option>
                ))}
              </select>

              <br></br>
              <br></br>
              <label htmlFor="publicKey">Contact&lsquo;s Wallet Address:</label>
              <div>
                <input
                  id="publicKey"
                  name="publicKey"
                  value={receiverAddress}
                  disabled
                  className="focus:outline-1 disabled:bg-gray-100 disabled:border-gray-200 form-control mb-3 mt-2"
                  placeholder="Select a contact to see wallet address"
                />
              </div>
              <label htmlFor="amount">Enter amount (in Ethers):</label>
              <div>
                <input
                  className="form-control mb-3 mt-2"
                  id="amount"
                  name="amount"
                  placeholder="0.01"
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>
              <label htmlFor="remark">Remarks (if any):</label>
              <input
                className="form-control mb-3 mt-2"
                name="remark"
                placeholder="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
              <button
                className="btn btn-warning mb-3"
                onClick={handleSendTransaction}
              >
                Send Transaction
              </button>
            </div>
          </div>
        )}

        {isPublicPayment && (
          <div className="container border mb-4 rounded-3 ps-4 pe-4">
            <div className="h4 mt-2 text-center">Pay to Public Key</div>
            {isPublicPaymentFailed && (
              <div className="transactionFailed">Transaction Failed!</div>
            )}
            {isPublicTransactionPending && (
              <div className="transactionPending">
                Transaction Pending... Please Wait!
              </div>
            )}
            {isPublicTransactionSuccess && (
              <div className="transactionSuccess">Transaction Successful!</div>
            )}
            <div className="h5">
              <label htmlFor="publicKey">Enter the Public Key:</label>
              <div>
                <input
                  className="form-control mb-3 mt-2"
                  id="publicKey"
                  name="publicKey"
                  placeholder="0x..."
                  value={receiverAddress}
                  onChange={handleAddressChange}
                />
              </div>
              <label htmlFor="amount">Enter amount (in Ethers):</label>
              <input
                className="form-control mb-3 mt-2"
                id="amount"
                name="amount"
                placeholder="0.01"
                value={amount}
                onChange={handleAmountChange}
              />
              <label htmlFor="remark">Remarks (if any):</label>
              <input
                className="form-control mb-3 mt-2"
                name="remark"
                placeholder="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
              <button
                className="btn btn-warning mb-3"
                onClick={handleSendTransaction}
              >
                Send Transaction
              </button>
            </div>
          </div>
        )}
        <br></br>
      </div>
    </>
  );
}

export default Dashboard;
