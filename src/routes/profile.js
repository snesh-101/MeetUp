const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth.js")
const User =require("../models/user.js");
const { validateEditProfileData } = require("../utils/validation.js");


profileRouter.get("/profile/view", userAuth, async (req, res)=>{
    try
    {
    //  console.log("je");
      const user=req.user;
    //  console.log(user)
      res.send(user);
     // console.log(req.signedCookies)
   
    }
    catch(err){
       console.error("Error loggin in the user:", err); // Log the full error in console
       res.status(400).json({ error: err.message });
    }
    
 })
//  profileRouter.patch("/profile/password", async (req, res)=>{

//  })
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
   try {
     const loggedInUser = req.user;
 
     if (!loggedInUser) {
       return res.status(401).json({ error: "User not authenticated" });
     }
 
     const gender = req.body.gender;
     if (gender && !["male", "female", "others"].includes(gender.toLowerCase())) {
       return res.status(400).send("Invalid gender");
     }
 
     Object.keys(req.body).forEach((key) => {
       loggedInUser[key] = req.body[key];
     });
 
     await loggedInUser.save();
 
     res.json({
       message: `${loggedInUser.firstName} your profile was updated successfully`,
       data: loggedInUser,
     });
   } catch (err) {
     console.error("Error editing the profile:", err.message);
     res.status(500).json({ error: "Internal Server Error" });
   }
 });
 
 
 module.exports=profileRouter;