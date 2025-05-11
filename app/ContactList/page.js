"use client";
import useDarkMode from "../darkMode";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import darkModeLogo from "../../public/WalboLogoDarkMode.png";
import "./page.css";
import "bootstrap/dist/css/bootstrap.min.css";

function ContactList() {
  const [isDark, toggleDarkMode] = useDarkMode();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [walboId, setWalboId] = useState("");
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editContact, setEditContact] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ContactCount, setContactCount] = useState(0);

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

  const fetchWalboIdAndContacts = async () => {
    try {
      const res = await fetch(
        `/api/users?walletAddress=${encodeURIComponent(address)}`
      );
      const data = await res.json();

      if (data.exists) {
        setContactCount(data.contacts.length);
        console.log(data.contacts);
        console.log(data.contacts.length);
        setWalboId(data.walboId);
        setContacts(data.contacts || []);
        setFilteredContacts(data.contacts || []);
      } else {
        alert("No Walbo account found. Please create an account.");
        router.push("/create-user");
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      alert("Failed to load contacts. Please try again.");
      router.push("/Main");
    }
  };

  useEffect(() => {
    if (address) {
      fetchWalboIdAndContacts();
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

  const handleContactButton = () => {};

  const handleAccountButton = () => {
    router.push("/Account");
  };

  const handleAddContact = () => {
    router.push("/CreateNewContact");
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.walboId.toLowerCase().includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleEditContact = (contact) => {
    setEditContact({ ...contact });
  };

  const handleSaveEdit = async () => {
    if (!editContact.name.trim()) {
      alert("Please enter a contact name.");
      return;
    }
    if (
      !editContact.publicKey.trim() ||
      !/^(0x)?[0-9a-fA-F]{40}$/.test(editContact.publicKey)
    ) {
      alert("Please enter a valid wallet address.");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walboId,
          contactId: editContact._id,
          updatedContact: {
            name: editContact.name,
            publicKey: editContact.publicKey,
            walboId: editContact.walboId || undefined,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Contact updated successfully!");
        setEditContact(null);
        await fetchWalboIdAndContacts();
      } else {
        alert(data.message || "Failed to update contact.");
      }
    } catch (err) {
      console.error("Error updating contact:", err);
      alert("Failed to update contact. Please try again.");
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walboId, contactId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Contact deleted successfully!");
        await fetchWalboIdAndContacts();
      } else {
        alert(data.message || "Failed to delete contact.");
      }
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert("Failed to delete contact. Please try again.");
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
      <div className={`DashboardHeader${isDark ? "-dark" : ""}`}>
        <div className="logo">
          {isDark ? (
            <Image src={darkModeLogo} width={350} alt="Walbo"></Image>
          ) : (
            <Image src={logo} width={350} alt="Walbo" priority></Image>
          )}{" "}
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
      <br></br>

      <div className="container h3">
        Contacts <span className="h4">({ContactCount})</span>
      </div>
      <div className="input-group mt-3 container">
        <input
className={`form-control ${isDark ? "bg-dark text-light" : "bg-light text-dark"}`}
          type="text"
          name="search"
          id="search"
          placeholder="Search a Contact by Name or Walbo ID"
          value={searchQuery}
          onChange={handleSearch}
        />
        <div
          className={`input-group-text btn btn-dark ${isDark ? "btn-secondary btn-outline-light" : "btn-dark"}`}
          onClick={handleAddContact}
        >
          Add New Contact
        </div>
      </div>
      <br></br>

      <div className="container">
        {filteredContacts.length > 0 ? (
          <table className={`table ${isDark ? "table-dark" : ""} table-hover container`}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Public Key</th>
                <th scope="col">Walbo ID</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact._id}>
                  <td>
                    {editContact && editContact._id === contact._id ? (
                      <input
                        type="text"
                        value={editContact.name}
                        onChange={(e) =>
                          setEditContact({
                            ...editContact,
                            name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      contact.name
                    )}
                  </td>
                  <td>
                    {editContact && editContact._id === contact._id ? (
                      <input
                        type="text"
                        value={editContact.publicKey}
                        onChange={(e) =>
                          setEditContact({
                            ...editContact,
                            publicKey: e.target.value,
                          })
                        }
                      />
                    ) : (
                      contact.publicKey
                    )}
                  </td>
                  <td>
                    {editContact && editContact._id === contact._id ? (
                      <input
                        type="text"
                        value={editContact.walboId || ""}
                        onChange={(e) =>
                          setEditContact({
                            ...editContact,
                            walboId: e.target.value,
                          })
                        }
                      />
                    ) : (
                      contact.walboId || "-"
                    )}
                  </td>
                  <td>
                    {editContact && editContact._id === contact._id ? (
                      <div className="btn-group">
                        <button
                          className={`btn ${isDark ? "btn-warning" : "btn-outline-primary"}`}
                          onClick={handleSaveEdit}
                        >
                          Save
                        </button>
                        <button
                          className={`btn ${isDark ? "btn-danger" : "btn-outline-danger"}`}
                          onClick={() => setEditContact(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="btn-group">
                        <button
                          className={`btn ${isDark ? "btn-warning" : "btn-outline-primary"}`}
                          onClick={() => handleEditContact(contact)}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn ${isDark ? "btn-danger" : "btn-outline-danger"}`}
                          onClick={() => handleDeleteContact(contact._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="noContacts h5">No contacts found.</div>
        )}
      </div>
    </>
  );
}

export default ContactList;
