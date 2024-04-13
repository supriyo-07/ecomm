const bcrypt = require("bcryptjs")
const user_model = require("../models/user.model")
const jwt = require("jsonwebtoken")
const secret = require("../configs/auth.config")
/**
 * Controller/logic to register a user...
 */
exports.signup = async (req,res)=>{
  /**
   * Logic to create the user
   */

  //1. Read the request body..
  const request_body = req.body  //this will get me the request body in the form of JS objects..

  //2. Insert the user in users collection in MongoDb..
  const userObj ={
    name : request_body.name,
    userId : request_body.userId,
    email : request_body.email,
    userType : request_body.userType,
    password : bcrypt.hashSync(request_body.password,8)

  }

  try{
   const user_created = await user_model.create(userObj)
   /**
    * Return this user..
    */
   const res_obj={
         name: user_created.name,
         userId : user_created.userId,
         email : user_created.email,
         userType : user_created.userType,
         createdAt : user_created.createdAt,
         updatedAt : user_created.updatedAt
   }

  res.status(201).send(res_obj) //status code 201 indicates succes in creating the model..
   
  }catch(err){
    console.log("Error while creating the user...", err)
    res.status(500).send({  //status code 500 means internal server error
      message : "Some error happened while registering the user..." 
    })
  }

  //3. Return the response back to the user..
  

}

exports.signin = async (req,res)=>{
  //Check if the userId is present in the system
  const user = await user_model.findOne({userId : req.body.userId})
  if(user==null){
    return res.status(400).send({
      message : "userId passed is not a valid userId"
    })
  }
  //Check if the password is correct
  const isPasswordValid = bcrypt.compareSync(req.body.password,user.password)
  if(!isPasswordValid){
    return res.status(401).send({
      message : "Wrong password passed!!"
    })
  }

  //Using jwt, we will create the access token with a given TTL (Time To Live) and return that token.
  const token = jwt.sign({id : user.userId},secret.secret,{ //takes on what data and a secret string as parameters
    expiresIn: 120  //this value is in sec
  })
  
res.status(200).send({
  name : user.name,
  userId : user.userId,
  email : user.email,
  userType : user.userType,
  accessToken : token
  })
}
