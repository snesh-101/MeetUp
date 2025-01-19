const express= require("express");
const app=express();
app.use("/",(req, res)=>{
    res.send("hell ");
});
app.use("/test", (req, res)=>{
    res.send("hello test");
});
app.listen(3000, ()=>{console.log("app is running on port 3000")});