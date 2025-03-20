const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth.js")
const User =require("../models/user.js")
profileRouter.get("/profile/view", userAuth, async (req, res)=>{
    try
    {
      console.log("je");
      const user=req.user;
      console.log(user)
      res.send(user);
     // console.log(req.signedCookies)
   
    }
    catch(err){
       console.error("Error loggin in the user:", err); // Log the full error in console
       res.status(400).json({ error: err.message });
    }
    
 })
 profileRouter.patch("/profile/edit", userAuth, async (req, res)=>{

 })
 module.exports=profileRouter;