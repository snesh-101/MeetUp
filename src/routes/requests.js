const express=require("express");
const {userAuth}=require("../middlewares/auth.js")

const ConnectionRequest =require("../models/connectionRequest.js")
const User=require('../models/user.js')
const requestRouter=express.Router();
requestRouter.post("/request/:status/:toUserId", userAuth,async(req, res)=>{
    try{
        const user=req.user;
        const status=req.params.status;
        const toUserId=req.params.toUserId;
        const fromUserId=user._id;

        const allowedStatus=["interested", "ignored"];
        if(!allowedStatus.includes(status)){
           return res.status(400).json("err: invalid status code");
        }
        const isToUserIdValid=await User.findOne({_id:toUserId});

        if(!isToUserIdValid)
        {
            return res.status(400).json({message:"the user you're trying to connect doesn't exist"});
        }
        if(toUserId===fromUserId)
        {
            return res.status(400).json({message:"cannot send request to yourself"})
        }
        const doesConnectionRequestExist=await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId:toUserId, toUserId:fromUserId}
            ]}
        )
        if(doesConnectionRequestExist){
            return res.status(400).json("connection request already exists!")
        }
        const connectionRequest= new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const data=await connectionRequest.save();
       res.json({
        message:req.user.firstName+" "+status+" "+isToUserIdValid.firstName,
        data
       })
    }
    catch(err){
        res.status(400).send("error: "+ err.message);
    }
 })
 requestRouter.post("/review/:status/:requestId", userAuth, async(req, res)=>{
    try{
        const loggedInUser=req.user;
        const requestId=req.params.requestId;
        const status=req.params.status;
        const allowedStatus=["accepted", "rejected"];
        if(!allowedStatus.includes(status)){
          return  res.status(400).json({message:"invalid status"});
        }
    
        const connectionRequest= await ConnectionRequest.findOne({_id:requestId,
        toUserId:loggedInUser._id,
        status:"interested"});
       if(!connectionRequest){
        return res.status(400).send("connection request not found");
       }
        const update=await ConnectionRequest.findByIdAndUpdate(requestId, {status:status});
        res.status(200).send("request updated successfully");
    }
    catch(err){
        res.status(400).send(err.message);
    }
 })
module.exports=requestRouter;
