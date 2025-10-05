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
userRouter.get("/courses" , async (req,res)=>{

});
userRouter.post("/purchase/course/:id" ,(req,res)=>{

})
module.exports = {
    userRouter
}