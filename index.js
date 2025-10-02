const express = require("express");
const mongoose = require("mongoose");
const z = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel, courseBoughtModel, courseModel } = require("./db");
const {auth , jwt_secret} = require("./auth");
const {admin} = require("./adminCheck");
mongoose.connect(process.env.mongo_url);
const app = express();
app.use(express.json());
app.post("/api/signup", async (req, res) => {
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
    password: z
      .string()
      .regex(
        /*  dont know regex just genrated by ai */
        /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*()_\-+=\[\]{};':"\\|,.<>\/?])(?!.*\s).*$/,
        {
          message:
            "Password must be 8+ chars, include lower+upper+digit+speciallike(!@#$%&*)), and no spaces.",
        }
      ),
  });
  
  const {success,data,error} = userSchema.safeParse(req.body);
  if (!success){
    return res.status(401).json({
        message:error.flatten(),
    })
  }
  let hashedpassword
  try {
   hashedpassword = await bcrypt.hash(data.password,10);
  }
  catch(error){
    console.log(error.message);
    return res.status(500).json({
       message: "server error"
    });
  }
  let response;
  try{
    response = await userModel.create({
        email:data.email,
        name:data.name,
        password:hashedpassword,
    })
    if(!response){
        return res.status(403).json({
            message:"uncaught error with db"
        })
    }
  } catch(error){
    console.log(error.message);
    return res.status(400).json({
        message:"email already exists"
    })
  }
  const token = jwt.sign({_id:response._id.toString()},jwt_secret);                  
  res.status(201).json({
    message:"signup successfull",
    token
  })
}); 
app.post("/api/signin", async (req,res) =>{
    const {email,password} = req.body;
    let dbResponse;
    try {
        dbResponse = await userModel.findOne({
            email
        })
        if (!dbResponse){
            return res.status(400).json({
                message:"user doesnot exist or  wrong email"
            })
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            message:"uncaught server error"
        })
    }
    const passwordResponse = await bcrypt.compare(password,dbResponse.password);
    if(!passwordResponse){
        return res.json({
            message:"wrong password"
        })
    }
    const token  = await  jwt.sign({_id : dbResponse._id},jwt_secret);
    res.status(200).json({
        message:"signedup successful"
        , token
    })
});
app.use(auth);
app.listen(process.env.port, () => {
  console.log("server started ...............................");
});
