const mongoose = require("mongoose");

const customizeSchema = new mongoose.Schema({
     name : { type : String, required : true},
     phonenumber : { type : String, required : true},
     dateoftravel : { type : Date, required : true},
     noofpeople : { type : Number, required : true},
     destination : { type : String, required : true}
});

module.exports = mongoose.model("customize",customizeSchema);