const express= require("express");
const bcrypt = require("bcryptjs");
const validator=require("validator");
const app=express();
const connectDB=require("./config/db.js")
   const {validateSignUpData}=require("./utils/validation.js")
   app.use(express.json());
   const User =require("./models/user.js")
    app.post("/signup", async (req, res)=>{
         
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
app.get("/login",async (req, res)=>{
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
      const isPassword=bcrypt.compare(password, user.password);
      if(isPassword)
      {
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
app.get("/user", async (req, res)=>{
   
   try{
      const user=await User.find({emailId: req.body.emailId});
      if(user.length===0)
      {
         res.status(400).send("user not found")
      }
      else
      res.send(user)
   }
   catch(err)
   {   res.status(400).send("something went wrong");

   }
})
app.get("/feed", async (req, res)=>{
   
   try{
      const user=await User.find({});
     
      res.send(user)
   }
   catch(err)
   {   res.status(400).send("something went wrong");

   }
})
app.delete("/user", async (req, res)=>{
   const userId=req.body.id;
   try{
   await  User.findByIdAndDelete(userId);
      res.send("user deleted successfully")
     
   }
   catch(err)
   {
      res.status(400).send("something went wrong");
   }
})
app.patch("/user/:id", async (req, res)=>{
   const id=req.params?.id;
   const data=req.body;
   
   try{
      const ALLOWED_UPATES=[
         "photoUrl", "gender", "age", "about", "skills"
      ]
      const isUpdateAllowed = Object.keys(data).every((k)=>
      ALLOWED_UPATES.includes(k));
      if(!isUpdateAllowed){
         throw new Error("Update is not allowed");
      }
    await  User.findOneAndUpdate({_id:id}, data,{
      runValidators:true
    });
      res.send("user updated successfully");
   }
   catch(err)
   {
      res.status(400).json("something went wrong : "+ err.message);
   }
   
})
connectDB().then(
   ()=>{
      console.log("database connected successfully")
      app.listen(3000, ()=>{
         console.log("sever running on port 3000")
      });
   }
).catch((err)=>{
   console.error("database couldn't be connected")
})