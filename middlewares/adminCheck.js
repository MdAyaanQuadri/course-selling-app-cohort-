const jwt = require("jsonwebtoken");
const jwt_secretAdmin = process.env.jwt_secretAdmin ;
const database  = require("../config/db")
const userModel = database.userModel;
 function  admin(req,res,next){
    const token = req.headers.authorization;
     jwt.verify(token, jwt_secretAdmin, async (err, decode) => {
       if (err) {
         return res.status(401).json({
           message: "redirect to signin page",
         });
       } else {
         req._id = decode._id;
         try {
           req.response = await userModel.findOne({
             _id: req._id,
           });
            if (req.response.role === "admin"){
                next();
            }
            else{
                return res.status(403).json({
                    message:"admin not found"
                })
            }
         } catch(error) {
            console.log(error.message);
            return res.status(400).json({
                message:"unpexted error with the data base"
            })
         }
       }
     });
}
module.exports = {
    jwt_secretAdmin,
    admin
}