const express  = require("../node_modules/express");
const Router = express.Router;
const adminRouter = Router();
// const z = require("../node_modules/zod");
const bcrypt = require("../node_modules/bcrypt");
const jwt = require("jsonwebtoken");
const { admin , jwt_secretAdmin} = require("../middlewares/adminCheck");
const { userModel, courseBoughtModel, courseModel } = require("../config/db");
adminRouter.post("/signin",async (req,res)=>{
    const { email, password } = req.body;
      let dbResponse;
      try {
        dbResponse = await userModel.findOne({
          email,
        });
        if (!dbResponse) {
          return res.status(400).json({
            message: "user doesnot exist or  wrong email",
          });
        }
        else if(dbResponse.role === "user"){
            return res.status(403).json({
                message:"user cant access admin endpoints"
            })
        }
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({
          message: "uncaught server error",
        });
      }

      const passwordResponse = await bcrypt.compare(password, dbResponse.password);
      if (!passwordResponse) {
        return res.json({
          message: "wrong password",
        });
      }
      const token = await jwt.sign({ _id: dbResponse._id }, jwt_secretAdmin);
      res.status(200).json({
        message: "signedup successful",
        token,
      });
})
module.exports={
    adminRouter
}