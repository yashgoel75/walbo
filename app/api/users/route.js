import { NextResponse } from "next/server";
import { connectMongoDB } from "@/libs/mongodb";
import Walbo from "@/models/walbo";
import jwt from "jsonwebtoken";

function verifyToken(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new Error("No token provided");
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid token");
  }
}

// POST: Create user, add transaction, or add contact
export async function POST(request) {
  try {
    const body = await request.json();

    await connectMongoDB();

    // CASE 1: Create new user (no token required)
    if (
      body.walletAddress &&
      body.walboId &&
      !body.contact &&
      !body.transactionHistory
    ) {
      const { walletAddress, walboId } = body;

      const existingUser = await Walbo.findOne({
        $or: [{ walletAddress }, { walboId }],
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "User already exists" },
          { status: 409 }
        );
      }

      const newUser = new Walbo({
        walboId,
        walletAddress,
        contacts: [],
        transactionHistory: [],
      });

      await newUser.save();
      return NextResponse.json(
        { message: "User created", user: newUser },
        { status: 201 }
      );
    }

    // For other operations (add transaction or contact), token is required
    const tokenUser = verifyToken(request);
    const dbUser = await Walbo.findOne({ walboId: body.walboId });

    if (!dbUser || dbUser.walletAddress !== tokenUser.walletAddress) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // CASE 2: Add transaction
    if (body.transactionHistory) {
      dbUser.transactionHistory.push(body.transactionHistory);
      await dbUser.save();
      return NextResponse.json(
        { message: "Transaction added", user: dbUser },
        { status: 200 }
      );
    }

    // CASE 3: Add contact
    if (body.contact) {
      const contact = body.contact;

      if (!contact.name || !contact.publicKey) {
        return NextResponse.json(
          { message: "Missing contact fields" },
          { status: 400 }
        );
      }

      const exists = dbUser.contacts?.some(
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

      dbUser.contacts.push(contact);
      await dbUser.save();
      return NextResponse.json(
        { message: "Contact added", user: dbUser },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  } catch (err) {
    console.error("POST error:", err.stack || err);
    return NextResponse.json(
      { message: "Server Error", error: err.message },
      { status: 500 }
    );
  }
}

// GET: public info or user info
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const walboId = searchParams.get("walboId");
    const walletAddress = searchParams.get("walletAddress");

    await connectMongoDB();

    if (walboId) {
      const user = await Walbo.findOne({ walboId });
      return NextResponse.json({
        exists: !!user,
        name: user?.name || null,
        walletAddress: user?.walletAddress || null,
        walboId: user?.walboId || null,
      });
    }

    if (walletAddress) {
      const tokenUser = verifyToken(request);
      if (walletAddress !== tokenUser.walletAddress) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
      }

      const user = await Walbo.findOne({ walletAddress });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        exists: true,
        walboId: user.walboId,
        contacts: user.contacts,
        transactionHistory: user.transactionHistory,
      });
    }

    return NextResponse.json(
      { message: "Missing query parameter" },
      { status: 400 }
    );
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { message: "Server Error", error: err.message },
      { status: 500 }
    );
  }
}

// PATCH: Edit contact (auth required)
export async function PATCH(request) {
  try {
    const { walboId, contactId, updatedContact } = await request.json();
    const tokenUser = verifyToken(request);

    await connectMongoDB();
    const user = await Walbo.findOne({ walboId });

    if (!user || user.walletAddress !== tokenUser.walletAddress) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
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
      (c, i) =>
        i !== contactIndex &&
        (c.publicKey === updatedContact.publicKey ||
          (updatedContact.walboId && c.walboId === updatedContact.walboId))
    );

    if (exists) {
      return NextResponse.json(
        { message: "Duplicate contact" },
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
      { message: "Contact updated", user },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { message: "Server Error", error: err.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove contact (auth required)
export async function DELETE(request) {
  try {
    const { walboId, contactId } = await request.json();
    const tokenUser = verifyToken(request);

    await connectMongoDB();
    const user = await Walbo.findOne({ walboId });

    if (!user || user.walletAddress !== tokenUser.walletAddress) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const index = user.contacts.findIndex(
      (c) => c._id.toString() === contactId
    );
    if (index === -1) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    user.contacts.splice(index, 1);
    await user.save();
    return NextResponse.json(
      { message: "Contact deleted", user },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { message: "Server Error", error: err.message },
      { status: 500 }
    );
  }
}
