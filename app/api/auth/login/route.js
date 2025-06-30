import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {const { walletAddress } = await req.json();
  const token = jwt.sign(
    { walletAddress: walletAddress }, // payload
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // optional: set token expiry
  );

  return NextResponse.json(
    { message: "Token Sent successfully", token },
    { status: 200 }
      );
  }
  catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Error" }, { status: 401 });
    }
}