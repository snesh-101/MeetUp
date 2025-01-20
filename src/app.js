const express= require("express");
const app=express();
app.get("/hello", (req, res)=>{
    res.send({firstName:"sneha", LastName: "Sharma"});
})
app.post("/hello", (req, res)=>{
      res.send("data saved successfully");
})
app.listen(3000, ()=>{console.log("app is running on port 3000")});