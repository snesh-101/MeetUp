const express=require("express");
const authRouter=express.Router();
const {validateSignUpData}=require("../utils/validation.js")
const bcrypt = require("bcryptjs");
const User =require("../models/user.js")
const validator=require("validator");
authRouter.post("/signup", async (req, res)=>{
         
    try {
       validateSignUpData(req);
       const {password, firstName, lastName, emailId}=req.body;
       passwordHash=await bcrypt.hash(password, 10);
       console.log(passwordHash);
       const user=new User({
          firstName,
          lastName,
          emailId,
          password:passwordHash,
       })
       await user.save(); 
       res.send("user added successfully")
    }
    catch(err){
       console.error("Error adding the user:", err); // Log the full error in console
       res.status(400).json({ error: err.message });
       //res.status(400).send("error adding the user", err)
    }
 })
 authRouter.get("/login",async (req, res)=>{
    try{
       const {emailId, password}=req.body;
       if(!validator.isEmail(emailId))
       {
          throw new Error("email is not valid");
       }
       const user=await User.findOne({emailId});
       if(!user)
       {
          throw new Error("invalid credentials");
       }
       const isPassword=user.validatePassword(password);
       if(isPassword)
       {
          const token=await user.getJWT();
          res.cookie("token", token);
          res.send("logged in successfully");
       }
       else
       {
          throw new Error("invalid credentials");
       }
    }
    catch(err){
       console.error("Error loggin in the user:", err); // Log the full error in console
       res.status(400).json({ error: err.message });
    }
    
 })
 authRouter.get("/logout", async (req, res)=>{
     res.cookie("token", null, {
      expires:new Date(Date.now())
     })
     res.send("logged out successfully");
 })
module.exports=authRouter;