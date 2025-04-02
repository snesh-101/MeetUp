const mongoose=require('mongoose');
const connectionRequest= new mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",//reference to the user collection
        required:true,
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:["accepted", "rejected", "pending", "interested"],
            message:`{VALUE} is incorrect`
        }
    } },

    {
        timestamps:true,
    }
);
connectionRequest.index({fromUserId:1, toUserId:1});
const connectionRequestModel=new mongoose.model("ConnectionRequest", connectionRequest);
module.exports=connectionRequestModel;  