"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  formatEther,
} from "viem";
import { sepolia } from "viem/chains";
import { waitForTransactionReceipt } from "viem/actions";

import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";

function Dashboard() {
  const [address, setaddress] = useState(undefined);
  const [isVisible, setisVisible] = useState(false);
  const [isWalboIdPayment, setisWalboIdPayment] = useState(false);
  const [isContactsPayment, setisContactsPayment] = useState(false);
  const [isPublicPayment, setisPublicPayment] = useState(false);
  const [isPublicPaymentFailed, setisPublicPaymentFailed] = useState(false);
  const [isPublicTransactionPending, setisPublicTransactionPending] =
    useState(false);
  const [isPublicTransactionSuccess, setisPublicTransactionSuccess] =
    useState(false);
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const name = searchParams.get("name");
  // const uid = searchParams.get("uid");
  // const query = `?uid=${uid}&name=${name}`;
  // console.log({ name, uid });
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
          await getBalance(address);
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

  const [balance, setBalance] = useState();

  const getBalance = async (address) => {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });

    const balance = await publicClient.getBalance({ address });
    const formatted = parseFloat(formatEther(balance)).toFixed(4);
    console.log(`ETH Balance: ${parseFloat(formatted).toFixed(4)}`);
    setBalance(formatted);
  };

  useEffect(() => {
    main();
  }, []);

  const handleContactButton = () => {
    router.push(`/ContactList`);
  };
  const handleAccountButton = () => {
    router.push(`/Account`);
  };
  const [receiverAddress, setreceiverAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddressChange = (e) => {
    setreceiverAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSendTransaction = async () => {
    setisPublicPaymentFailed(false);
    const client = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    });

    const [address] = await client.getAddresses();
    try {
      if (!receiverAddress || !amount || isNaN(amount)) {
        alert("Please enter a valid address and amount.");
        return;
      }
      const hash = await client.sendTransaction({
        account: address,
        to: receiverAddress,
        value: parseEther(amount),
      });
      setisPublicTransactionPending(true);
      const receipt = await waitForTransactionReceipt(client, { hash });
      if (receipt !== undefined) {
        setisPublicTransactionPending(false);
        setisPublicTransactionSuccess(true);
        setAmount("");
        setreceiverAddress("");
      }
      setTimeout(() => {
        setisPublicTransactionSuccess(false);
      }, 5000);
    } catch (error) {
      console.log(error);
      setisPublicPaymentFailed(true);
    }
  };

  return (
    <>
      <div className="DashboardHeader">
        <div>
          <Image src={logo} width={200} alt="Walbo" priority />
        </div>

        <div className="nav">
          <ul>
            <li>HOME</li>
            <li onClick={handleContactButton}>CONTACTS</li>
            <li onClick={handleAccountButton}>MY ACCOUNT</li>
          </ul>
        </div>
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
          <div className="getBalance" onClick={() => setisVisible(false)}>
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
              setisVisible(true);
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
            setisWalboIdPayment(true);
            if (isContactsPayment) setisContactsPayment(false);
            if (isPublicPayment) setisPublicPayment(false);
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
            setisContactsPayment(true);
            if (isWalboIdPayment) setisWalboIdPayment(false);
            if (isPublicPayment) setisPublicPayment(false);
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
            setisPublicPayment(true);
            if (isWalboIdPayment) setisWalboIdPayment(false);
            if (isContactsPayment) setisContactsPayment(false);
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
      </div>

      {isWalboIdPayment ? (
        <div className="payWalboContainer">
          <div className="payWalboHeading">Pay to Walbo ID</div>
          {isPublicPaymentFailed ? (
            <div className="transactionFailed">Transaction Failed!</div>
          ) : (
            ""
          )}
          {isPublicTransactionPending ? (
            <div className="transactionPending">
              Transaction Pending... Please Wait!
            </div>
          ) : (
            ""
          )}
          {isPublicTransactionSuccess ? (
            <div className="transactionSuccess">Transaction Successful!</div>
          ) : (
            ""
          )}

          <div className="payWalboContent">
            <label htmlFor="walboId" name="walboId" id="walboId">
              Enter the Walbo ID of the receiver:
            </label>
            <input
              id="walboId"
              name="walboId"
              placeholder="0x..."
              value={receiverAddress}
              onChange={handleAddressChange}
            ></input>
            <label htmlFor="amount" name="amount" id="amount">
              Enter amount (in Ethers):
            </label>
            <input
              id="amount"
              name="amount"
              placeholder="0.01"
              value={amount}
              onChange={handleAmountChange}
            ></input>
            <button onClick={() => handleSendTransaction()}>
              Send Transaction
            </button>
          </div>
        </div>
      ) : (
        ""
      )}

      {isContactsPayment ? (
        <div className="payContactsContainer">
          <div className="payContactsHeading">Pay to a Contact</div>
          {isPublicTransactionPending ? (
            <div className="transactionPending">
              Transaction Pending... Please Wait!
            </div>
          ) : (
            ""
          )}
          {isPublicTransactionSuccess ? (
            <div className="transactionSuccess">Transaction Successful!</div>
          ) : (
            ""
          )}

          <div className="payContactContent">
            <label htmlFor="contact" name="contact" id="contact">
              Enter the name to pay:
            </label>
            <input
              id="contact"
              name="contact"
              placeholder="Search a Name"
              value={receiverAddress}
              onChange={handleAddressChange}
            ></input>
            <label htmlFor="amount" name="amount" id="amount">
              Enter amount (in Ethers):
            </label>
            <input
              id="amount"
              name="amount"
              placeholder="0.01"
              value={amount}
              onChange={handleAmountChange}
            ></input>
            <button onClick={() => handleSendTransaction()}>
              Send Transaction
            </button>
          </div>
        </div>
      ) : (
        ""
      )}

      {isPublicPayment ? (
        <div className="payPublicContainer">
          <div className="payPublicKeyHeading">Pay to Public Key</div>
          {isPublicTransactionPending ? (
            <div className="transactionPending">
              Transaction Pending... Please Wait!
            </div>
          ) : (
            ""
          )}
          {isPublicTransactionSuccess ? (
            <div className="transactionSuccess">Transaction Successful!</div>
          ) : (
            ""
          )}

          <div className="payPublicKeyContent">
            <label htmlFor="publicKey" name="publicKey" id="publicKey">
              Enter the Public Key:
            </label>
            <input
              id="publicKey"
              name="publicKey"
              placeholder="0x..."
              value={receiverAddress}
              onChange={handleAddressChange}
            ></input>
            <label htmlFor="amount" name="amount" id="amount">
              Enter amount (in Ethers):
            </label>
            <input
              id="amount"
              name="amount"
              placeholder="0.01"
              value={amount}
              onChange={handleAmountChange}
            ></input>
            <button onClick={() => handleSendTransaction()}>
              Send Transaction
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default Dashboard;
