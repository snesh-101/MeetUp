const validator=require("validator");
const validateSignUpData=(req)=>{
    const{firstName, lastName, emailId, password}=req.body;
    if(!firstName||!lastName){
        throw new Error("name is not valid");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("email is not valid");
    }
    // else if(!validator.isStrongPassword(password))
    // {
    //     throw new Error("please enter a strong password");
    // }
};
const validateEditProfileData=(req)=>{
    const allowedFields=["firstName", "lastName", "emailId", "photoUrl", "gender", "about", "skills", "age"]
   const isEditAllowed= Object.keys(req.body).every(
        (field)=>{
            
            allowedFields.includes(field)
        }
    )
    return isEditAllowed;
}
module.exports={validateSignUpData, validateEditProfileData};