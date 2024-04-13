const user_model = require("../models/user.model")
const jwt = require("jsonwebtoken")
const auth_config = require("../configs/auth.config")
/**
 * create a middleware which checks if the request body is proper and correct..
 */

const verifySignUpBody = async (req,res,next)=>{

    try{
      //check for the name
       if(!req.body.name){
        return res.status(400).send({
          message : "Failed! name was not provided in request body.."
        })
       }
      //check for the email
      if(!req.body.email){
        return res.status(400).send({
          message : "Failed! email was not provided in the request body.."
        })
      }

      //check for the userID
      if(!req.body.userId){
        return res.status(400).send({
          message: "Failed! UserId was not provided in the request body.."
        })
      }

      //check if the user with the same userID is already present
      const user= await user_model.findOne({userId : req.body.userId})

      if(user){
        return res.status(400).send({
          message : "Failed! user with same userId is already present.."
        })
      }

      next()

    }catch(err){
      console.log("Error while validating the request object",err)
      res.status(500).send({
        message : "Error while validating the request body"
      })
    }
}

const verifySignInBody = async (req,res,next)=>{
  if(!req.body.userId){
    return res.status(400).send({
      message : "UserId is not provided"
    })

  }

  if(!req.body.password){
    return res.status(400).send({
      message :"Password is not provided"
    })
  }
  next()
}

const verifyToken = (req,res,next)=>{
  //Check if the token is present in the header
  const token = req.headers['x-access-token']  //if in the header, x-access-token is passed

  if(!token){
    return res.status(403).send({
      message : "No token found : UnAuthorized"
    })
  }

  //check if the token is a valid token
 jwt.verify(token, auth_config.secret,async (err,decoded)=>{
   if(err){
    return res.status(401).send({
      message : "UnAuthorized !"
    })
   }
   const user = await user_model.findOne({userId : decoded.id})
   if(!user){
    return res.status(400).send({
      message : "UnAuthorized, the user for this token does not exists.."
    })
   }
   //Set the user info in the request body
   req.user = user
   next()
 })
  


  //move to next step
}

const isAdmin = (req,res,next)=>{
  const user = req.user
  if(user && user.userType == "ADMIN"){
    next()
  }
  else{
    res.status(403).send({
      message : "Only ADMIN users are allowed to access this endpoint" 
    })
  }

}

module.exports = {
  verifySignUpBody : verifySignUpBody,
  verifySignInBody : verifySignInBody,
  verifyToken : verifyToken,
  isAdmin : isAdmin
}