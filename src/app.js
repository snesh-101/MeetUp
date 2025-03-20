const express= require("express");
const bcrypt = require("bcryptjs");

const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const app=express();
app.use(express.json());
app.use(cookieParser());
const connectDB=require("./config/db.js")



const User =require("./models/user.js")
    
const authRouter=require("./routes/auth.js")
const profileRouter=require("./routes/profile.js")
const requestRouter=require("./routes/requests.js")

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);


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