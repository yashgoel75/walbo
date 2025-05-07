import { connectMongoDB } from "@/libs/mongodb";
import Walbo from "@/models/walbo";
import { NextResponse } from "next/server";

// Add a contact to an existing Walbo user
export async function POST(request) {
  try {
    const { walboId, contact } = await request.json();
    await connectMongoDB();

    // Validate input
    if (!walboId || !contact || !contact.name || !contact.publicKey) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the Walbo document by pushing the contact to the contacts array
    const updatedWalbo = await Walbo.findOneAndUpdate(
      { walboId },
      { $push: { contacts: contact } },
      { new: true }
    );

    if (!updatedWalbo) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Contact added successfully!", data: updatedWalbo },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Duplicate walboId or walletAddress" },
        { status: 400 }
      );
    }
    console.error("Error adding contact:", error);
    return NextResponse.json(
      { message: "Error adding contact", error: error.message },
      { status: 500 }
    );
  }
}

// Get Walbo user by walboId or walletAddress
export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const walboId = searchParams.get("walboId");
    const walletAddress = searchParams.get("walletAddress");

    let walbo;
    if (walboId) {
      walbo = await Walbo.findOne({ walboId });
      return NextResponse.json(
        {
          exists: !!walbo,
          walletAddress: walbo?.walletAddress || "",
          walboId: walbo?.walboId || "",
        },
        { status: 200 }
      );
    } else if (walletAddress) {
      walbo = await Walbo.findOne({ walletAddress });
      return NextResponse.json(
        {
          exists: !!walbo,
          walletAddress: walbo?.walletAddress || "",
          walboId: walbo?.walboId || "",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Missing walboId or walletAddress" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user", error: error.message },
      { status: 500 }
    );
  }
}