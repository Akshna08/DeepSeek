import { Webhook } from "svix";
import ConnectDB from "../../../config/db";
import User from "../../../models/userModel";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req){
    const wh = new Webhook(process.env.SIGNING_SECRET);
    const headerPayload = await headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-signature": headerPayload.get("svix-signature"),
    }

    //  Get the payload and verify it
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const {data, type} = wh.verify(body, svixHeaders);

    // Prepare the user data to be saved in the database
    const userData = {
        _id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email_addresses[0].email_address,
        image: data.image_url,
    };

    await ConnectDB();

    switch (type) {
        case "user.created":
            // Create a new user in the database
            await User.create(userData);
            break;

        case "user.updated":
            // Update the existing user in the database
            await User.findByIdAndUpdate(data.id, userData);
            break;

        case "user.deleted":
            // Delete the user from the database
            await User.findByIdAndDelete(data.id);
            break;
        default:
            break;
    }
    return NextRequest.json({message:"Event received"})
}