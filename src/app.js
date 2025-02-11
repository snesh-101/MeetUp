const express= require("express");
const app=express();
 const {adminAuth, userAuth}=require("./middlewares/auth.js")
app.use("/admin", adminAuth);
app.get("/user", userAuth, (req, res)=>{
   res.send("user is authorized");
})
app.get("/admin/getAllData", (req, res, next)=>{
   res.send("data sent");
})
app.delete("/admin/deleteData", (req, res)=>{
   res.send("data deletedd");
})
app.listen(3000, ()=>{console.log("app is running on port 3000")});