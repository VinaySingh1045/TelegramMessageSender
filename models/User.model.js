import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            unique: true
        },
        telegramSession: String, // Telegram session to send messages from user account
    }
);
export const User = mongoose.model("User", userSchema);