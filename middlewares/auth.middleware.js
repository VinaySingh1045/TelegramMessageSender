import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

export const verfiyJWT = async (req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies?.token;
        console.log("Token:", token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user request",
            });
        }

        // Verify and decode the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decodedToken);

        // Normalize phone format if necessary
        // const phone = decodedToken.phone.startsWith("+")
        //     ? decodedToken.phone
        //     : `+${decodedToken.phone}`;

        // Find user in the database
        // const phone1 = "+919512279656";
        // const user1 = await User.findOne({ phone });
        // console.log("User found:", user);


        const user = await User.findOne({ phone : decodedToken.phone });
        console.log("User from DB:", user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Access Token",
            });
        }

        // Attach user to the request
        req.user = user;
        next();
    } catch (error) {
        console.log("Error during token verification:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Access token expired" });
        }

        res.status(500).json({ error: "Token verification failed" });
    }
};
