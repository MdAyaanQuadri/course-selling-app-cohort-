const express = require("express");
const app = express(); 
const dotenv = require("dotenv");
dotenv.config();
const { userRouter } = require("./routes/user");
app.use(express.json());
app.use("/api/user",userRouter);
// app.use("/api/course",courseRouter);
// app.use("/api/admin",adminRouter);
app.listen(process.env.port, () => {
  console.log("server started ...............................");
});
