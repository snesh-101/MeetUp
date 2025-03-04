const jwt=require("jsonwebtoken")
//const User=require("./models/user.js")
  
const User =require("../models/user.js")
const userAuth=async (req, res, next)=>{
    try{
    const {token}=req.cookies;
    if(!token)
    {
        throw new Error("token is not valid")
    }
    const decodedObj=await jwt.verify(token,process.env.JWT_SECRET);
    const {_id}=decodedObj;
    const user=await User.findById(_id);
    if(!user)
    {
        throw new Error("user not found")
    }
    req.user=user;
    next();
} catch(err){
    console.error("Error loggin in the user:", err); // Log the full error in console
    res.status(400).json({ error: err.message });
 }
    
};
module.exports={userAuth};