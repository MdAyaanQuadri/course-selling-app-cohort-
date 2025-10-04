
const mongoose = require("mongoose");

mongoose.connect(process.env.mongo_url);
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const user = new Schema({
  name: {
    type: String,
    // required:true
  },
  email: {
    type: String,
    unique:true
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});
const video = new Schema({
  videoTitle: String,
  videoPath: String,
  thumbnailPath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const course = new Schema({
  name: String,
  price: Number,
  instructor: String,
  courseDescription: String,
  content: [video],
  // videoPath:String
  // ,thumbnailPath:String
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const courseBought = new Schema({
  userId: ObjectId,
  cousrseId: ObjectId,
  name: String,
  price: Number,
  instructor: String,
  courseDescription: String,
  thumbnailPath: String,
  boughtAt: {
    type: Date,
    default: Date.now,
  },
});
const userModel = mongoose.model("users", user);
const courseBoughtModel = mongoose.model("coursesBought", courseBought);
const courseModel = mongoose.model("courses", course);
module.exports = {
  userModel,
  courseModel,
  courseBoughtModel,
};
  


