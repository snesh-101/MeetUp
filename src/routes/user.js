const express=require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest=require("../models/connectionRequest");
const User = require("../models/user");

const userRouter=express.Router();
userRouter.get("/user/requests/received", userAuth, async(req, res)=>{
    try{
        user=req.user;
        const allRequests=await ConnectionRequest.find({
        toUserId:user._id,
        status:"interested"}).populate("fromUserId", ["firstName","lastName", "age", "photoUrl", "about", "skills"]);
        if(allRequests.length===0){
            return res.send("no requests found");
        }
        res.json({message:"data fecthed",
        data:allRequests });
    }
    catch(err){
        res.status(400).send(err.message);
    }
})
userRouter.get("/user/connections", userAuth,async (req, res)=>{
    try{
        user=req.user;
        const connections=await ConnectionRequest.find({
          $or:[  {toUserId:user._id,
            status:"accepted"},
            {fromUserId:user._id, status:"accepted"}
          ]
        }).populate("fromUserId", ["firstName","lastName", "age", "photoUrl", "about", "skills"]).populate(
            "toUserId",  ["firstName","lastName", "age", "photoUrl", "about", "skills"]
        );
        if(connections.length===0)
        {{
            return res.send("no connections found")
        }}
        const data =  connections.map((row)=>{
            if(row.fromUserId._id.toString()===user._id.toString())
            {return row.toUserId}
            return row.fromUserId})
        res.json({message:"data fetched", data:data});
    }
    catch(err){
        res.send(err.message)
    }
})
userRouter.get("/user/feed",userAuth, async (req, res)=>{
    try{
        user=req.user;
        const page=parseInt(req.query.page) || 1;
    let limit=parseInt(req.query.limit)||10;
    limit=limit>50?50:limit;
        const skip=(page-1)*limit;

        const connectionRequests=await ConnectionRequest.find({
            $or:[
                {fromUserId:user._id},
                {toUserId:user._id}
            ]
        }).select('fromUserId toUserId')
        const hideUsersFromFeed=new Set()
        connectionRequests.forEach((req)=>{
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        })
        const availableUsers=await User.find({
            $and:[
                {_id:{$ne:user._id}},
               { _id: {$nin: Array.from(hideUsersFromFeed)}},

            ]
        }).select('firstName lastName photoUrl age gender about skills')
        .skip(skip  )
        .limit(limit)
        res.status(200).send(availableUsers);
    }
    catch(err){
        res.send(err.message);

    }
})
module.exports=userRouter;