const express  = require("../node_modules/express");
const Router = express.Router;
const adminRouter = Router();
// const z = require("../node_modules/zod");
const bcrypt = require("../node_modules/bcrypt");
const jwt = require("jsonwebtoken");
const { admin , jwt_secretAdmin} = require("../middlewares/adminCheck");
const { userModel,courseBoughtModel, courseModel ,videoModel} = require("../config/db");
adminRouter.post("/signin",async (req,res)=>{
    const { email, password } = req.body;
      let userModelResponse;
      try {
        userModelResponse = await userModel.findOne({
          email,
        });
        if (!userModelResponse) {
          return res.status(400).json({
            message: "user doesnot exist or  wrong email",
          });
        }
        else if(userModelResponse.role === "user"){
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

      const passwordResponse = await bcrypt.compare(password, userModelResponse.password);
      if (!passwordResponse) {
        return res.json({
          message: "wrong password",
        });
      }
      const token = await jwt.sign({ _id: userModelResponse._id }, jwt_secretAdmin);
      res.status(200).json({
        message: "signedup successful",
        token,
      });
})
adminRouter.use(admin);
adminRouter.post("/courses/add-courses",async(req,res)=>{
    const adminId = req._id
    const {name,price,instructor,courseDescription,courseThumbnail} = req.body;
    let courseModelResponse;
    const count = await courseModel.countDocuments({
      adminId
    });
    const incCount  = count + 1;
    try{
     courseModelResponse = await courseModel.create({
      name,
      price,
      instructor,
      adminId,
      courseDescription,
      courseThumbnail,
      serialNo:incCount
    });
    if(!courseModelResponse){
         return res.status(400).json({
           message: "unexpected error",
         });
    }
}catch(error){
    console.log(error.message);
     return res.ststus(500).json({
        message:"server error"
     })
}
   return res.status(201).json({
    message:"successfully created a course",
    courseModelResponse
   })
})
adminRouter.post("/courses/add-video/:courseId",async(req,res)=>{
        
        const courseId = req.params.courseId;
        const count = await videoModel.countDocuments({
          courseId,
        });
        const incCount = count + 1;
        const {videoTitle,videoPath} = req.body;
        let courseModelResponse;
        try {
            courseModelResponse = await courseModel.findOne({
               _id:courseId, 
            })
            if(!courseModelResponse){
                return res.status(400).json({
                    message:"couse doesn't exist"
                })
            }
        }catch(error){
            console.log(error.message);
            return res.status(500).json({
                message:"server error with db"
            })
        }
        let videoModelResponse;
        try{
            videoModelResponse = await videoModel.create({
                courseId,
                videoPath,
                videoTitle,
                serialNo:incCount
            });
            if(!videoModelResponse){
                return res.status(400).json({
                    message:"unexpected error with db "
                });
            }
        }catch(error){
            console.log(error.message);
            return res.status(500).json({
              message: "unexpected error with server ",
            });
        }
            return res.status(201).json({
                message:"video added succesfully",
                videoModelResponse
            })
})

module.exports={
    adminRouter
}