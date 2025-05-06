const mongoose=require("mongoose");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const bcrypt=require("bcryptjs")
const validator = require('validator');
const userSchema= new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength:4,
        maxLength:50,
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
        validate:{
            validator:(emailId)=> validator.isEmail(emailId),
            message:"email is not valid"
        } 
    },
    password:{
        type: String,
        required:true,
        validate:{
            validator:(password)=>{return validator.isStrongPassword(password)},
            message:(props)=>{return `password is not strong enough ${props.value}`}
        }
    },
    age:{
        type:Number,
        min:18,
    },
    gender: {
        type: String,
        validate: {
            validator: (gender) =>  ["male", "female", "others"].includes(gender?.toLowerCase()),
            message: "Gender data is not valid"
        }
    },    
    photoUrl:{
        type:String,
        default:"https://i.pinimg.com/736x/98/1d/6b/981d6b2e0ccb5e968a0618c8d47671da.jpg",
        validate:{
            validator:(photoUrl)=> validator.isURL(photoUrl),
            message:"url is not valid"
        } 
    },
    about:{
        type: String,
        default:"this is the default description of user"
    },
    skills:{
        type:[String],
        validate:{
            validator:(skills)=>{
               return skills.length<=10;
            },
            message:"only up to 10 skills allowed"
        }
    }
    

}, {
    timestamps:true
})
// userSchema.methods.getJWT=  function(){
//     const user=this;
//     const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });
// console.log("Generated Token:", token);
//     return token
// }
userSchema.methods.getJWT = async function () {
    const token = await jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  //  console.log("Generated Token:", token);
    return token; // Do NOT return an async function!
};
userSchema.methods.validatePassword=async function(passwordInputByUser){
    const user=this;
    const passwordHash=user.password;
    //commenting out the password hash for testing, remove it later
   // const isPasswordValid= await bcrypt.compare( passwordInputByUser, passwordHash);
    const isPasswordValid=passwordHash===passwordInputByUser
    return isPasswordValid;
}

const User=mongoose.model("User", userSchema);
module.exports=User;