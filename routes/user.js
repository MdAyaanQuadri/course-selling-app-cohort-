const express  = require("../node_modules/express");
const Router = express.Router;
const userRouter = Router();
const z = require("../node_modules/zod");
const bcrypt = require("../node_modules/bcrypt");
const jwt = require("jsonwebtoken");
const {  auth, jwt_secretUser} = require("../middlewares/auth")
const { userModel, courseBoughtModel, courseModel } = require("../config/db");
userRouter.post("/signup", async (req, res) => {
  const userSchema = z.object({
    name: z
      .string()
      .trim()
      .min(3)
      .max(100)
      .transform((val) => val.toLowerCase()),
    email: z
      .string()
      .email()
      .max(100)
      .transform((val) => val.toLowerCase()),
    password: z.string().regex(
      /*  dont know regex just genrated by ai */
      /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*()_\-+=\[\]{};':"\\|,.<>\/?])(?!.*\s).*$/,
      {
        message:
          "Password must be 8+ chars, include lower+upper+digit+speciallike(!@#$%&*)), and no spaces.",
      }
    ),
  });

  const { success, data, error } = userSchema.safeParse(req.body);
  if (!success) {
    return res.status(401).json({
      message: error.flatten(),
    });
  }
  let hashedpassword;
  try {
    hashedpassword = await bcrypt.hash(data.password, 10);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "server error",
    });
  }
  let userModelResponse;
  try {
    userModelResponse = await userModel.create({
      email: data.email,
      name: data.name,
      password: hashedpassword,
    });
    if (!userModelResponse) {
      return res.status(403).json({
        message: "uncaught error with db",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      message: "email already exists",
    });
  }
  const token = jwt.sign({ _id: userModelResponse._id.toString() }, jwt_secretUser);
  res.status(201).json({
    message: "signup successfull",
    token,
  });
});
userRouter.post("/signin", async (req, res) => {
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
  const token = await jwt.sign({ _id: userModelResponse._id }, jwt_secretUser);
  res.status(200).json({
    message: "signedup successful",
    token,
  });
});
userRouter.use(auth);
userRouter.get("/courses" , async (req,res)=>{
  let courseModelResponse;
    try { courseModelResponse  = await courseModel.find();
    if(!courseModelResponse){
      return res.status(400).json({
        message:"there are no courses available"
      })
    }
    return res.status(200).json({
      message:"Courses found",
      courseModelResponse,
    });
    }catch(error){
      console.log(error.message);
      return res.status(500).json({
        message:"unexpected server error"
      })
    }
});
userRouter.get("/courses/:courseId" ,async (req,res)=>{
        // const userId =  req._id;
        const  courseId = req.params.courseId;
        let courseModelResponse;
        try { courseModelResponse = await courseModel.findById(courseId);
        if(!courseModelResponse){
          return res.status(404).json({
            message:"no courses found"
          })
        }
        }catch(error){
          console.log(error.message);
          return res.status(500).json({
            message: "unexpected server error",
          });
        }
        return res.status(200).json({
          message:"found",
          courseModelResponse
        })
})
userRouter.post("/courses/purchase/:courseId", async (req,res) =>{
  const userId =  req._id;
  let {price} = req.body;
  const courseId = req.params.courseId;
  console.log(courseId);
  let courseModelResponse;
  try {
    courseModelResponse = await courseModel.findOne({
      _id:courseId
    });
    if (!courseModelResponse) {
      return res.status(404).json({
        message: "no courses found",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "unexpected server error",
    });
  }
  if(price != courseModelResponse.price){
    return res.status(400).json({
      message:"plz enter the exact amount needed to but that course"
    })
  }
  let courseBoughtModelResponse ;
  try {
    courseBoughtModelResponse = await courseBoughtModel.create({
      userId,
      courseId,
      name: courseModelResponse.name,
      // courseDesription:courseModelResponse.courseDescription,
      thumbnailPath: courseModelResponse.thumbnailPath,
      instructor: courseModelResponse.instructor,
    });
    if (!courseBoughtModelResponse) {
      return res.status(404).json({
        message: "error in creation",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "unexpected server error in course bought",
    });
  }
  return res.status(200).json({
    message: "course bought succesfully",
    courseBoughtModelResponse,
  }); 
 })
module.exports = {
    userRouter
}