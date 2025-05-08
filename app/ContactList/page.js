"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import Image from "next/image";
import logo from "../../public/WalboLogo.png";
import "./page.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function ContactList() {
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

  const handleContactButton = () => {

  };

  const handleAccountButton = () => {
    router.push("/Account");
  };

  const handleAddContact = () => {
    router.push("/CreateNewContact");
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = contacts.filter((contact) =>
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
    if (!editContact.publicKey.trim() || !/^(0x)?[0-9a-fA-F]{40}$/.test(editContact.publicKey)) {
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
            <li onClick={() => { handleHomeButton(); setIsMenuOpen(false) }}>Home</li>
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

      <div className="container h3">Contacts <span className="h4">({ContactCount})</span></div>
        <div className="input-group mt-3 container">
          <input
            className="form-control"
            type="text"
            name="search"
            id="search"
            placeholder="Search a Contact by Name or Walbo ID"
            value={searchQuery}
            onChange={handleSearch}
          />
        <div className="input-group-text btn btn-dark" onClick={handleAddContact}>
          Add New Contact
        </div>
      </div>
      <br></br>
      
      <div className="container">
        {filteredContacts.length > 0 ? (
          <table className="table table-hover container">
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
                          setEditContact({ ...editContact, name: e.target.value })
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
                          setEditContact({ ...editContact, publicKey: e.target.value })
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
                          setEditContact({ ...editContact, walboId: e.target.value })
                        }
                      />
                    ) : (
                      contact.walboId || "-"
                    )}
                  </td>
                  <td>
                    {editContact && editContact._id === contact._id ? (
                      <div className="btn-group">
                        <button className="btn btn-outline-primary" onClick={handleSaveEdit}>Save</button>
                        <button className="btn btn-outline-danger" onClick={() => setEditContact(null)}>Cancel</button>
                      </div>
                    ) : (
                        <div className="btn-group">
                        <button className="btn btn-outline-primary" onClick={() => handleEditContact(contact)}>Edit</button>
                        <button className="btn btn-outline-danger" onClick={() => handleDeleteContact(contact._id)}>
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