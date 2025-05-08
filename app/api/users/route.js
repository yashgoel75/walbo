  import { NextResponse } from "next/server";
  import { connectMongoDB } from "@/libs/mongodb";
  import Walbo from "@/models/walbo";
  export async function POST(request) {
    try {
      const { walboId, contact } = await request.json();

      if (!walboId || !contact || !contact.name || !contact.publicKey) {
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

      // Optional: prevent duplicate contact by wallet address or Walbo ID
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

      // Add contact to user's contact list
      user.contacts = [...(user.contacts || []), contact];
      await user.save();

      return NextResponse.json(
        { message: "Contact added successfully!", user },
        { status: 200 }
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
            walletAddress: existingUser.walletAddress,
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
                walboId: existingUser.walboId,
            contacts: existingUser.contacts,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { message: "Missing query parameter (walboId or walletAddress)" },
        { status: 400 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: "Server Error", error: error.message },
        { status: 500 }
      );
    }
  }
