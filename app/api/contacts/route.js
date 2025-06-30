import { NextResponse } from "next/server";
import { connectMongoDB } from "@/libs/mongodb";
import Walbo from "@/models/walbo";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const walletAddress = decoded.address;

    await connectMongoDB();

    const user = await Walbo.findOne({ walletAddress });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      walboId: user.walboId,
      contacts: user.contacts,
      transactionHistory: user.transactionHistory,
    });
  } catch (err) {
    console.error("JWT or DB error:", err);
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}
