const express=require("express");
const {userAuth}=require("../middlewares/auth.js")

const User =require("../models/user.js")
const requestRouter=express.Router();
requestRouter.post("/sendConnectionRequest", userAuth, (req, res)=>{
    const user=req.user;
       res.send(user.firstName+"sent connection request");
 })
module.exports=requestRouter;