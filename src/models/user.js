const mongoose=require("mongoose");
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
            validator: (gender) => ["male", "female", "others"].includes(gender),
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
const User=mongoose.model("User", userSchema);
module.exports=User;