
const mongoose = require("mongoose");
const { string } = require("zod");

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
  courseId: ObjectId,
  videoTitle: String,
  videoPath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  serialNo: {
    type: Number,
    // default: 0,
  },
});
const course = new Schema({
  name: String,
  price: Number,
  instructor: String,
  courseDescription: String,
  adminId: ObjectId,
  courseThumbnail: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  serialNo: {
    type: Number,
    // default:0
  },
});
const courseBought = new Schema({
  userId: ObjectId,
  cousrseId: ObjectId,
  name: String,
  // price: Number,
  instructor: String,
  // courseDescription: String,
  thumbnailPath: String,
  boughtAt: {
    type: Date,
    default: Date.now,
  },
});
const userModel = mongoose.model("users", user);
const courseBoughtModel = mongoose.model("coursesBought", courseBought);
const courseModel = mongoose.model("courses", course);
const videoModel = mongoose.model("videos",video);
module.exports = {
  userModel,
  courseModel,
  courseBoughtModel,
  videoModel,
};
  


