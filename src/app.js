const express= require("express");
const bcrypt = require("bcryptjs");

const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const http=require("http");
const app=express();

app.use(cors({
  origin: 'http://localhost:5173',
   credentials:true,
   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
}));
app.use(express.json());
app.use(cookieParser());
const connectDB=require("./config/db.js")



const User =require("./models/user.js")
    
const authRouter=require("./routes/auth.js")
const profileRouter=require("./routes/profile.js")
const requestRouter=require("./routes/requests.js");
const userRouter = require("./routes/user.js");
const initializeSocket = require("./utils/socket.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
const chatRouter = require("./routes/chat.js"); // Import the chat route
app.use("/chat", chatRouter); // Mount the chat router at /chat path

const server=http.createServer(app);

initializeSocket(server)

connectDB().then(
   ()=>{
      console.log("database connected successfully")
      server.listen(3000, ()=>{
         console.log("sever running on port 3000")
      });
   }
).catch((err)=>{
   console.error("database couldn't be connected")
}) 