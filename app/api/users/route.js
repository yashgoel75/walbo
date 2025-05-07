// import { connectToDatabase } from "../../../lib/mongodb.js";
// import Walbo from "../../../lib/models/Walbo.js";

// // Handle GET request — check if a user exists by walboId or walletAddress
// export async function GET(req) {
//   await connectToDatabase();

//   const { searchParams } = new URL(req.url);
//   const walboId = searchParams.get("walboId");
//   const walletAddress = searchParams.get("walletAddress");

//   if (!walboId && !walletAddress) {
//     return new Response(JSON.stringify({ error: "Missing walboId or walletAddress" }), { status: 400 });
//   }

//   const query = { walletAddress: walletAddress };

//   try {
//     const user = await Walbo.findOne(query);
//       if (!user) {
//         console.log("User Not Found")
//     //   return new Response(JSON.stringify({ exists: false }), { status: 404 });
//     }
//     return new Response(JSON.stringify({ exists: true, user }), { status: 200 });
//   } catch (error) {
//     console.error("GET Error:", error);
//     return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
//   }
// }

// // Handle POST request — create a new Walbo user
// export async function POST(req) {
//   await connectToDatabase();

//   const body = await req.json();
//   const { walboId, walletAddress, profileName } = body;

//   if (!walboId || !walletAddress || !profileName) {
//     return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
//   }

//   try {
//     const newUser = new Walbo({
//       walboId,
//       walletAddress: walletAddress.toLowerCase(),
//       profileName,
//       contacts: [],
//     });

//     const savedUser = await newUser.save();
//     return new Response(JSON.stringify({ success: true, user: savedUser }), { status: 201 });
//   } catch (error) {
//     console.error("POST Error:", error);

//     if (error.code === 11000) {
//       return new Response(JSON.stringify({ error: "User with same ID or address already exists" }), { status: 409 });
//     }

//     return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500 });
//   }
// }
