import { NextResponse } from "next/server";
import { connectMongoDB } from "@/libs/mongodb";
import Walbo from "@/models/walbo";

export async function POST(request) {
  try {
    const body = await request.json();

    await connectMongoDB();

    // CASE 1: Creating a new user
    if (body.walletAddress && body.walboId && !body.contact) {
      const { walletAddress, walboId } = body;

      // Check if user already exists
      const existingUser = await Walbo.findOne({
        $or: [{ walletAddress }, { walboId }],
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "User already exists" },
          { status: 409 }
        );
      }

      // Create and save new user
      const newUser = new Walbo({ walboId, walletAddress, contacts: [] });
      await newUser.save();

      return NextResponse.json(
        { message: "User created successfully", user: newUser },
        { status: 201 }
      );
    }

    // CASE 2: Adding a contact
    if (body.walboId && body.contact) {
      const { walboId, contact } = body;

      if (!contact.name || !contact.publicKey) {
        return NextResponse.json(
          { message: "Missing required fields" },
          { status: 400 }
        );
      }

      const user = await Walbo.findOne({ walboId });

      if (!user) {
        return NextResponse.json(
          { message: "User with this Walbo ID not found" },
          { status: 404 }
        );
      }

      const exists = user.contacts?.some(
        (c) =>
          c.publicKey === contact.publicKey ||
          (contact.walboId && c.walboId === contact.walboId)
      );

      if (exists) {
        return NextResponse.json(
          { message: "Contact already exists" },
          { status: 409 }
        );
      }

      user.contacts = [...(user.contacts || []), contact];
      await user.save();

      return NextResponse.json(
        { message: "Contact added successfully!", user },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const walboId = searchParams.get("walboId");
    const walletAddress = searchParams.get("walletAddress");

    await connectMongoDB();

    if (walboId) {
      const existingUser = await Walbo.findOne({ walboId });
      return NextResponse.json(
        {
          message: existingUser
            ? "Walbo ID already in use"
            : "Walbo ID is available",
          exists: !!existingUser,
          walletAddress: existingUser ? existingUser.walletAddress : null,
        },
        { status: 200 }
      );
    }

    if (walletAddress) {
      const existingUser = await Walbo.findOne({ walletAddress });
      return NextResponse.json(
        {
          message: existingUser
            ? "Wallet address found"
            : "Wallet address not found",
          exists: !!existingUser,
          walboId: existingUser ? existingUser.walboId : null,
          contacts: existingUser ? existingUser.contacts : [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Missing query parameter (walboId or walletAddress)" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { walboId, contactId, updatedContact } = await request.json();

    if (!walboId || !contactId || !updatedContact || !updatedContact.name || !updatedContact.publicKey) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await Walbo.findOne({ walboId });
    if (!user) {
      return NextResponse.json(
        { message: "User with this Walbo ID not found" },
        { status: 404 }
      );
    }

    const contactIndex = user.contacts.findIndex(
      (c) => c._id.toString() === contactId
    );
    if (contactIndex === -1) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    const exists = user.contacts.some(
      (c, index) =>
        index !== contactIndex &&
        (c.publicKey === updatedContact.publicKey ||
          (updatedContact.walboId && c.walboId === updatedContact.walboId))
    );
    if (exists) {
      return NextResponse.json(
        { message: "Contact with this public key or Walbo ID already exists" },
        { status: 409 }
      );
    }

    user.contacts[contactIndex] = {
      _id: user.contacts[contactIndex]._id,
      name: updatedContact.name,
      publicKey: updatedContact.publicKey,
      walboId: updatedContact.walboId || undefined,
    };
    await user.save();

    return NextResponse.json(
      { message: "Contact updated successfully!", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { walboId, contactId } = await request.json();

    if (!walboId || !contactId) {
      return NextResponse.json(
        { message: "Missing walboId or contactId" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await Walbo.findOne({ walboId });
    if (!user) {
      return NextResponse.json(
        { message: "User with this Walbo ID not found" },
        { status: 404 }
      );
    }

    const contactIndex = user.contacts.findIndex(
      (c) => c._id.toString() === contactId
    );
    if (contactIndex === -1) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    user.contacts.splice(contactIndex, 1);
    await user.save();

    return NextResponse.json(
      { message: "Contact deleted successfully!", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}