const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    packageid : { type : String, required : true},
    user : { type : String, required : true},
    name : { type : String, required : true},
    email : { type : String, required : true},
    phonenumber : { type : String, required : true},
    dateoftravel : { type : String, required : true},
    numberofpeople : { type : Number, required : true},
    remarks : { type : String }
});

module.exports = mongoose.model("booking",bookingSchema);