import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

export const verfiyJWT = function authenticateToken(req, res, next) {

    // const token = req.cookies?.token
    const token = req.headers["authorization"];

    if (!token) return res.status(401).send("Access Denied");

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) return res.status(403).send("Invalid Token");

        req.user = user;

        next();

    });
}

// export const verfiyJWT = async (req, res, next) => {

//     try {
//         const token = req.cookies?.token

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Unauthorized user request"
//             })
//         }

//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

//         const user = await User.findById(decodedToken?._id)

//         if (!user) {
//             throw new ApiError(401, "Invalid Access Token")
//         }

//         req.user = user
//         next();

//     } catch (error) {
//         console.log(error);
//     }
// }