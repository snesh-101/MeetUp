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
 profileRouter.patch("/profile/edit", userAuth, async (req, res)=>{
   try{
      if(!validateEditProfileData){
         res.status(400).send("invalid edit req")
      }
    
      const loggedInUser=req.user;
      console.log(loggedInUser)
      Object.keys(req.body).forEach((key)=>{
         loggedInUser[key]=req.body[key];
      })
     await loggedInUser.save();
     console.log(loggedInUser)
      // res.send("profile updated successfully")
      res.json({
         message:`${loggedInUser.firstName} your profile was updated successfully`,
         data:loggedInUser

      })
   }
   catch (err) {
      console.error("Error editing the profile:", err.message)}  

 })
 module.exports=profileRouter;