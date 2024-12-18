import { StringSession } from "telegram/sessions/index.js";
import { User } from "../models/User.model.js";
import { TelegramClient } from "telegram";
import jwt from "jsonwebtoken";


const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_Hash;

const userLogin = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    console.log("Phone received:", phone);



    let user = await User.findOne({ phone });
    console.log("User found:", user);

    const sessionString = user ? user.telegramSession : "";

    const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
    });

    try {
        await client.connect();

        if (!user) {
            console.log("User not found, starting Telegram client");
            await client.start({
                phoneNumber: phone,
                phoneCode: async () => {
                    console.log("Waiting for code...");
                    return new Promise((resolve) => {
                        codeStore[phone] = resolve;
                        res.status(200).json({ message: "Enter the code sent to your Telegram app" });
                    });
                },
            });

            const sessionString = client.session.save();
            console.log("Session string saved:", sessionString);

            user = new User({ phone, telegramSession: sessionString });
            await user.save();
            console.log("New user saved:", user);
            return;
        }
    } catch (err) {
        console.error("Error during Telegram login:", err);
        res.status(500).json({ error: "Telegram authentication failed" });
    } finally {
        await client.disconnect();
    }
};



const codeStore = {}; // Temporary in-memory store for codes

const submitCode = async (req, res) => {
    const { phone, code } = req.body;


    if (!phone || !code) {
        return res.status(400).json({ error: "Phone number and code are required" });
    }

    if (!codeStore[phone]) {
        return res.status(400).json({ error: "Login not initiated for this phone number" });
    }

    try {
        // Resolve the promise with the code
        codeStore[phone](code);
        delete codeStore[phone]; // Clean up after use
        return res.status(200).json({ message: "Code submitted successfully. Login in progress." });

    } catch (err) {
        console.error("Error during code submission:", err);
        res.status(500).json({ error: "Failed to submit code" });
    }

    const options = {
        httpOnly: true,
        sameSite: "none",
        secure: true
    };

    // For existing users, respond with success
    const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // res.status(200).json({ message: "Logged in successfully", token });
    // res.cookie("token", token, options);
    res.status(200)
        .cookie("token", token, options)
        .json({ message: "Logged in successfully" }); // Send JWT as a cookie instead of JSON response

};


const sendTask = async (req, res) => {

    const { task } = req.body;

    try {

        const user = await User.findOne({ phone: req.user.phone });

        if (!user) return res.status(404).send({ error: "User not found" });

        const client = new TelegramClient(new StringSession(user.telegramSession), apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.connect();

        const groupId = process.env.TELEGRAM_GROUP_ID;
        await client.sendMessage(groupId, { message: `Task from ${user.phone}: ${task}` });

        res.send({ message: "Task sent successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to send task" });
    }

}

export { userLogin, submitCode, sendTask }