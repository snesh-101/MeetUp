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

app.use("/", (err, req, res, next)=>{
   res.status(500).send("OOPS! Something went wrong");
})
app.listen(3000, ()=>{console.log("app is running on port 3000")});