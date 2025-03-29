const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const userAuth = async (req, res, next) => {
    try {
        // Retrieve token from cookies or Authorization header
        let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

     //   console.log("Received Token:", token);

        if (!token) {
            console.error("Token is missing");
            return res.status(401).json({ error: "Authentication token is required" });
        }

        // Verify the token
        const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
       //  console.log("Decoded JWT:", decodedObj);

        const { _id } = decodedObj;
        const user = await User.findById(_id);

        if (!user) {
            console.error("User not found in database");
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Error logging in user:", err.message);

        let statusCode = 400;
        if (err.name === "JsonWebTokenError") statusCode = 401; // Invalid token
        if (err.name === "TokenExpiredError") statusCode = 403; // Expired token

        res.status(statusCode).json({ error: err.message });
    }
};

module.exports = { userAuth };
