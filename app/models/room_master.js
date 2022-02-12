var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;


var roomMasterSchema = new mongoose.Schema(
    {
        iUserId:{
           type:ObjectId,
           ref:"user_master",
        }, 
        vDeviceSerialNo:{
            type:String
        },
        vDeviceName:{
            type:String
        },
        switchData:{
            type:Array
        },
        iDeviceStartDate: {
            type:Number
        },
        iWarrantyEndDate:{
            type:Number
        },
        tiDeviceBlockByAdmin:{
            type:Boolean
        },
        iCreatedAt:{
          type: Number,
        }, 
        iUpdatedAt:{
            type:Number
        }    
    },
    { versionKey: false }
);




module.exports = mongoose.model("room_master", roomMasterSchema);
