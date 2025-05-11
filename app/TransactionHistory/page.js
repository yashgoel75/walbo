"use client";
import useDarkMode from "../darkMode";
import darkModeLogo from "../../public/WalboLogoDarkMode.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";
import "bootstrap/dist/css/bootstrap.min.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function ContactList() {
  const [isDark, toggleDarkMode] = useDarkMode();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [info, setInfo] = useState(false); // `info` stores selected transaction or `false`

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

  const fetchTransactionHistory = async () => {
    try {
      const res = await fetch(
        `/api/users?walletAddress=${encodeURIComponent(address)}`
      );
      const data = await res.json();
      if (data.exists) {
        console.log(data);
        console.log("Transaction History:", data.transactionHistory);
        setTransactionHistory(data.transactionHistory || []);
      } else {
        alert("No Walbo account found. Please create an account.");
        router.push("/create-user");
      }
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      alert("Failed to load transaction history. Please try again.");
      router.push("/Main");
    }
  };

  useEffect(() => {
    if (address) {
      fetchTransactionHistory();
    }
  }, [address]);

  useEffect(() => {
    main();
  }, []);

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

  const handleHomeButton = () => {
    router.push("/Dashboard");
  };

    const handleContactButton = () => {
      router.push("/ContactList");
  };

  const handleAccountButton = () => {
    router.push("/Account");
  };

  // Handle row click to show transaction details
  const handleRowClick = (transaction) => {
    setInfo(transaction); // Set the selected transaction
  };

  // Handle back button to return to table
  const handleBackButton = () => {
    setInfo(false); // Reset to show table
  };

  return (
    <>
      <div className="darkModeToggle">{isDark ? (
        <svg onClick={toggleDarkMode}
          xmlns="http://www.w3.org/2000/svg"
          height="30px"
          viewBox="0 -960 960 960"
          width="30px"
          fill="#ffffff"
        >
          <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z" />
        </svg>
      ) : (
        <svg onClick={toggleDarkMode}
          xmlns="http://www.w3.org/2000/svg"
          height="30px"
          viewBox="0 -960 960 960"
          width="30px"
          fill="#000000"
        >
          <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
        </svg>
      )}</div>
      <div className={`DashboardHeader${isDark ? "-dark" : ""}`}>
        <div className="logo">
{isDark ? <Image src={darkModeLogo} width={350} alt="Walbo"></Image> : <Image src={logo} width={350} alt="Walbo" priority></Image>}        </div>
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
            <li
              onClick={() => {
                handleHomeButton();
                setIsMenuOpen(false);
              }}
            >
              Home
            </li>
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
      <br />

      <div className="container h3">Transaction History</div>
      <br />

      <div className="container">
        {info ? (
          <div className="transactionInfo">
            <button
              className="btn btn-secondary mb-2"
              onClick={handleBackButton}
            >
              Back to Transactions
            </button>
            <h4>Transaction Details</h4>
            <div className={`card mb-3 ${isDark ? "bg-dark text-white" : ""}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center px-5 mb-4">
                  <div
                    className="text-center"
                    style={{ flex: "1 1 0", maxWidth: "40%" }}
                  >
                    <strong>From</strong>
                    <div className="text-truncate">
                      {info.fromName ||
                        info.fromWalboId ||
                        info.fromPublicKey ||
                        "N/A"}
                    </div>
                  </div>

                  <div className="text-center" style={{ flex: "0 0 auto" }}>
                    {isDark ? <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="30px"
                      viewBox="0 -960 960 960"
                      width="30px"
                      fill="#ffffff"
                    >
                      <path d="m480-320 160-160-160-160-56 56 64 64H320v80h168l-64 64 56 56Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg> : <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="30px"
                      viewBox="0 -960 960 960"
                      width="30px"
                      fill="#000000"
                    >
                      <path d="m480-320 160-160-160-160-56 56 64 64H320v80h168l-64 64 56 56Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>}
                  </div>

                  <div
                    className="text-center"
                    style={{ flex: "1 1 0", maxWidth: "40%" }}
                  >
                    <strong>To</strong>
                    <div className="text-truncate">
                      {info.toName ||
                        info.toWalboId ||
                        info.toPublicKey ||
                        "N/A"}
                    </div>
                  </div>
                </div>
                <p>
                  <strong>Type:</strong>{" "}
                  {info.type === "0" ? "Received" : "Sent"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {dayjs(info.createdAt).format("DD-MM-YYYY")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {dayjs(info.createdAt).format("hh:mm A")}
                </p>
                <p>
                  <strong>From:</strong> {info.fromPublicKey}
                </p>
                <p>
                  <strong>To:</strong> {info.toPublicKey}
                </p>
                <p>
                  <strong>Amount:</strong> {info.amount} SepoliaETH
                </p>
                <p>
                  <strong>Remarks:</strong> {info.remark || "N/A"}
                </p>
                <p>
                  <strong>Transaction Hash: </strong>
                  {info.transactionHash || "N/A"}
                </p>
                <p>
                  <strong>Status: </strong>
                  <span
                    className={`badge ${
                      info.status === "Pending"
                        ? "bg-warning"
                        : info.status === "Success"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {info.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
              ) : transactionHistory.length > 0 ? (
                      <div className="table-responsive">
          <table className={`table table-hover container text-end ${isDark ? "table-dark" : ""}`}>
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">From</th>
                <th scope="col">To</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Remarks</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...transactionHistory].reverse().map((transaction, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(transaction)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    {transaction.type === "0" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#78A75A"
                      >
                        <path d="M200-200v-400h80v264l464-464 56 56-464 464h264v80H200Z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#EA3323"
                      >
                        <path d="m216-160-56-56 464-464H360v-80h400v400h-80v-264L216-160Z" />
                      </svg>
                    )}
                  </td>
                  <td>{dayjs(transaction.createdAt).format("DD-MM-YYYY")}</td>
                  <td>{dayjs(transaction.createdAt).format("hh:mm A")}</td>
                  <td>
                    {transaction.fromName ||
                      transaction.fromWalboId ||
                      transaction.fromPublicKey}
                  </td>
                  <td>
                    {transaction.toName ||
                      transaction.toWalboId ||
                      transaction.toPublicKey}
                  </td>
                  <td>{transaction.amount} SepoliaETH</td>
                  <td>{transaction.remark || "N/A"}</td>
                  <td>
                    {transaction.status === "Pending" ? (
                      <span className="badge bg-warning">Pending</span>
                    ) : transaction.status === "Success" ? (
                      <span className="badge bg-success">Success</span>
                    ) : (
                      <span className="badge bg-danger">Failed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
                      </table>
                      </div>
        ) : (
          <div className="h5">No transactions found.</div>
        )}
      </div>
    </>
  );
}

export default ContactList;
