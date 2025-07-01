const express=require("express");
const authRouter=express.Router();
const {validateSignUpData}=require("../utils/validation.js")
const bcrypt = require("bcryptjs");
const User =require("../models/user.js")
const validator=require("validator");

authRouter.post("/signup", async (req, res)=>{
         
    try {
       validateSignUpData(req);
       const { password, firstName, lastName, emailId, about, skills, age, photoUrl } = req.body;
       passwordHash=await bcrypt.hash(password, 10);
       console.log(passwordHash);
       const user=new User({
          firstName,
          about, 
          skills,
          age,
          photoUrl,
          lastName,
          emailId,
          password
          // password:passwordHash,
       })
       const savedUser=await user.save(); 
       const token = await savedUser.getJWT();
      // res.cookie("token", token,{ expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
       res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.json({ message: "user added successfully", data: savedUser });
      
       res.json({message:"user added successfully", data:savedUser})
    }
    catch(err){
       console.error("Error adding the user:", err); // Log the full error in console
       res.status(400).json({ error: err.message });
       //res.status(400).send("error adding the user", err)
    }
 })
 authRouter.post("/login", async (req, res) => {
   try {
     const {emailId, password} = req.body;
     if (!validator.isEmail(emailId)) {
       throw new Error("Enter a valid email");
     }
     const user = await User.findOne({emailId});
     if (!user) {
       throw new Error("Invalid credentials!");
     }
     // Add await here
     const isPassword = await user.validatePassword(password);
     if (isPassword) {
       const token = await user.getJWT();
      // res.cookie("token", token,{ expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.send(user);
      
       res.send(user);
     } else {
       throw new Error("invalid credentials");
     }
   } catch(err) {
     console.error("Error logging in the user:", err);
     res.status(400).json({ error: err.message });
   }
 });

 authRouter.post("/logout", async (req, res)=>{
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0)
  });
  res.send("logged out successfully");
  
 })
 
module.exports=authRouter;
