import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            unique: true
        },
        telegramSession: {
            type: String
        },
    }
);
export const User = mongoose.model("User", userSchema);