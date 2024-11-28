// import { StringSession } from "telegram/sessions";
import { StringSession } from "telegram/sessions/index.js";
// const { TelegramClient } = require("telegram");
// const { StringSession } = require("telegram/sessions");
import { User } from "../models/User.model.js";
import { TelegramClient } from "telegram";
import jwt from "jsonwebtoken";

// const userLogin = async (req, res) => {
//     const { phone } = req.body
//     let apiId = process.env.API_ID;
//     let apiHash = process.env.API_HASH;

//     let user = await User.findOne({ phone });
//     if (!user) {
//         const stringSession = new StringSession(""); // Blank session for new users
//         const client = new TelegramClient(stringSession, apiId, apiHash, {
//             connectionRetries: 5,
//         });
//     }

//     try {
//         await client.start({
//             phoneNumber: phone,
//             phoneCode: async () => {
//                 const code = await new Promise((resolve) => {
//                     console.log(`Enter the code sent to ${phone}: `);
//                     process.stdin.once("data", (input) => resolve(input.toString().trim()));
//                 });
//                 return code;
//             },
//         });

//         const sessionString = client.session.save();
//         user = new User({ phone, telegramSession: sessionString });
//         await user.save();
//     } catch (err) {
//         return res.status(500).send({ error: "Telegram authentication failed" });
//     } finally {
//         await client.disconnect();
//     }

// }

// const userLogin = async (req, res) => {
//     const { phone } = req.body;

//     if (!phone) {
//         return res.status(400).json({ error: "Phone number is required" });
//     }

//     // const apiId = process.env.API_ID;
//     // const apiHash = process.env.API_HASH;


//     const apiId = 27771017
//     const apiHash = "c94c3473fb5d2405fcec45ec74542fff";

//     let user = await User.findOne({ phone });

//     // If user exists, retrieve session
//     const sessionString = user ? user.telegramSession : "";

//     // Initialize Telegram client
//     const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
//         connectionRetries: 5,
//     });

//     try {
//         await client.connect();

//         if (!user) {
//             // Start login process for new users
//             await client.start({
//                 phoneNumber: phone,
//                 phoneCode: async () => {
//                     // Send code back to the user for them to enter
//                     res.status(200).json({ message: "Enter the code sent to your Telegram app" });
//                     return new Promise((resolve) => {
//                         req.on("code", (code) => resolve(code)); // Listen for the user's code input
//                     });
//                 },
//             });

//             // Save new user with session
//             const sessionString = client.session.save();
//             user = new User({ phone, telegramSession: sessionString });
//             await user.save();
//         }

//         // Login successful
//         res.status(200).json({ message: "Logged in successfully" });
//     } catch (err) {
//         console.error("Error during Telegram login:", err);
//         res.status(500).json({ error: "Telegram authentication failed" });
//     } finally {
//         await client.disconnect();
//     }
// };

// const userLogin = async (req, res) => {
//     const { phone } = req.body;

//     if (!phone) {
//         return res.status(400).json({ error: "Phone number is required" });
//     }

//     const apiId = 27771017;
//     const apiHash = "c94c3473fb5d2405fcec45ec74542fff";

//     let user = await User.findOne({ phone });

//     const sessionString = user ? user.telegramSession : "";

//     const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
//         connectionRetries: 5,
//     });

//     try {
//         await client.connect();

//         if (!user) {
//             await client.start({
//                 phoneNumber: phone,
//                 phoneCode: async () => {
//                     // Store the promise resolver for the code
//                     return new Promise((resolve) => {
//                         codeStore[phone] = resolve;
//                         res.status(200).json({ message: "Enter the code sent to your Telegram app" });
//                     });
//                 },
//             });

//             const sessionString = client.session.save();
//             user = new User({ phone, telegramSession: sessionString });
//             await user.save();
//         }
//         res.status(200).json({ message: "Logged in successfully" });
//     } catch (err) {
//         console.error("Error during Telegram login:", err);
//         res.status(500).json({ error: "Telegram authentication failed" });
//     } finally {
//         await client.disconnect();
//     }
//     // Generate JWT for authenticated users
//     const token = jwt.sign({ phone: User.phone }, process.env.JWT_SECRET, { expiresIn: "7d" });
//     res.send({ token });
// };


const userLogin = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    const apiId = 27771017;
    const apiHash = "c94c3473fb5d2405fcec45ec74542fff";

    let user = await User.findOne({ phone });
    const sessionString = user ? user.telegramSession : "";

    const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
    });

    try {
        await client.connect();

        if (!user) {
            // For new users, start the login process
            await client.start({
                phoneNumber: phone,
                phoneCode: async () => {
                    // Save the promise resolver in the code store
                    return new Promise((resolve) => {
                        codeStore[phone] = resolve;
                        res.status(200).json({ message: "Enter the code sent to your Telegram app" });
                    });
                },
            });

            // Save the new user
            const sessionString = client.session.save();
            user = new User({ phone, telegramSession: sessionString });
            await user.save();
            return; // Prevent further response
        }

        const options = {
            httpOnly: true,
            sameSite: "none",
            secure: true
        };
        // For existing users, respond with success
        const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // res.status(200).json({ message: "Logged in successfully", token });
        res.cookie("token", token, options);
        res.status(200).json({ message: "Logged in successfully" }); // Send JWT as a cookie instead of JSON response

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
        res.status(200).json({ message: "Code submitted successfully. Login in progress." });

    } catch (err) {
        console.error("Error during code submission:", err);
        res.status(500).json({ error: "Failed to submit code" });
    }

};


const sendTask = async (req, res) => {

    const { task } = req.body;

    // let apiId = process.env.API_ID;
    // let apiHash = process.env.API_HASH;


    const apiId = 27771017;
    const apiHash = "c94c3473fb5d2405fcec45ec74542fff";


    try {

        const user = await User.findOne({ phone: req.user.phone });

        if (!user) return res.status(404).send({ error: "User not found" });

        const client = new TelegramClient(new StringSession(user.telegramSession), apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.connect();

        const groupId = "https://t.me/tohsalTask";
        await client.sendMessage(groupId, { message: `Task from ${user.phone}: ${task}` });

        res.send({ message: "Task sent successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to send task" });
    }

}

export { userLogin, submitCode, sendTask }