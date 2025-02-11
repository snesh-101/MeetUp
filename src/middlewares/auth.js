 const adminAuth= (req, res, next)=>{
    const token="abc";
    const isauthorized=token==="abc";
    if(isauthorized)
    {
        next();
    }
    else
    {
        res.status(401).send("user is not authorized");
    }
};
const userAuth= (req, res, next)=>{
    const token="abc";
    const isauthorized=token==="abc";
    if(isauthorized)
    {
        next();
    }
    else
    {
        res.status(401).send("user is not authorized");
    }
};
module.exports={adminAuth, userAuth};