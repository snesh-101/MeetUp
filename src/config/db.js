require('dotenv').config({ path: '../.env' }); // Force load .env
const mongoose=require("mongoose");
//console.log("Mongo URI:", process.env.MONGO_URI);
const connectDB= async()=>{
   await mongoose.connect(process.env.MONGO_URI);
}
module.exports=connectDB; 
    
