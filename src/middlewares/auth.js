const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Please log in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Use _id because your token signs with {_id: this._id}
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);

    const statusCode =
      err.name === "JsonWebTokenError" ? 401 :
      err.name === "TokenExpiredError" ? 403 :
      400;

    res.status(statusCode).json({ error: err.message });
  }
};

module.exports = { userAuth };
