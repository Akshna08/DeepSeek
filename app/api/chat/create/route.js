import ConnectDB from "../../../../config/db";
import Chat from "../../../../models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const {userId} = getAuth(req);
        if (!userId) {
            return NextResponse.json({ sucess: false , message:"User not authenticated",});
        }

        // Prepare the chat data to be saved int the database
        const chatData = {
            userId,
            name: "New Chat",
            messages: [],
        };

        // connect to the database and create a new chat
        await ConnectDB();
        await Chat.create(chatData);

        return NextResponse.json({success:true,message:"Chat created"})
    } catch (error) {
        return NextResponse.json({success:false,error: error.message});
    }
}