var mongoose = require("mongoose");
// const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

var userMasterSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
      // required: true,
    },
    userName: {
      type: String,
      default: "",
      // required:true,
    },
    address: {
      type: Number,
      default: 2,
      // 2=NormalUser, 1=Admin
    },
    email: {
      type: String,
      required: true,
    },
    chargeeBeeId:{
      type:String,
    },
    chargeeBeeSelectedPlan:{
      type:String
    }
  },
  { versionKey: false }
);

module.exports = mongoose.model("user_masters", userMasterSchema);
