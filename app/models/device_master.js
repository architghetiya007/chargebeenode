var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var deviceMasterSchema = new mongoose.Schema(
    {
        vDeviceSerialNo: {
            type: String,
        },
        tiDeviceStatus: {
            type: Number,
            default: 1,
            // 0= Inactive, 1=Active
        },
        vManufactureDate: {
            type: Number,
            default:0,
        },
        iCreatedAt: {
            type: Number,
        },
        iUpdatedAt: {
            type: Number
        }
    },
    { versionKey: false }
);




module.exports = mongoose.model("device_master", deviceMasterSchema);
